package com.matf.pzv.controllers;

import com.matf.pzv.db.dto.*;
import com.matf.pzv.models.Cabin;
import com.matf.pzv.models.CabinImage;
import com.matf.pzv.models.Reservation;
import com.matf.pzv.models.User;
import com.matf.pzv.services.ImageResizeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/owner")
public class OwnerController {

    private final ReservationRepoInterface reservationRepo;
    private final CabinRepoInterface cabinRepo;
    private final CabinImageRepoInterface cabinImageRepo;
    private final UserRepoInterface userRepo;
    private final ReviewRepoInterface reviewRepo;
    private final ImageResizeService imageResizeService;

    public OwnerController(ReservationRepoInterface reservationRepo, CabinRepoInterface cabinRepo,
                           CabinImageRepoInterface cabinImageRepo, UserRepoInterface userRepo,
                           ReviewRepoInterface reviewRepo, ImageResizeService imageResizeService) {
        this.reservationRepo = reservationRepo;
        this.cabinRepo = cabinRepo;
        this.cabinImageRepo = cabinImageRepo;
        this.userRepo = userRepo;
        this.reviewRepo = reviewRepo;
        this.imageResizeService = imageResizeService;
    }

    @PostMapping("/reservations/{id}/accept")
    public ResponseEntity<?> acceptReservation(@PathVariable long id) {
        Reservation reservation = reservationRepo.findById(id).orElse(null);
        if (reservation == null) {
            return ResponseEntity.badRequest().body("Reservation not found");
        }
        long ownerId = getCurrentUserId();
        Cabin cabin = cabinRepo.findById(reservation.getCabinId()).orElse(null);
        if (cabin == null || cabin.getOwnerId() != ownerId) {
            return ResponseEntity.badRequest().body("Not authorized");
        }
        if (reservationRepo.hasConflict(reservation.getCabinId(), reservation.getStartDate(), reservation.getEndDate(), id)) {
            return ResponseEntity.badRequest().body("Date conflict with existing reservation");
        }
        reservationRepo.updateStatus(id, "ACCEPTED", null);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reservations/{id}/reject")
    public ResponseEntity<?> rejectReservation(@PathVariable long id, @RequestBody Map<String, String> body) {
        String comment = body.get("comment");
        reservationRepo.updateStatus(id, "REJECTED", comment);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<Map<String, Object>>> getCalendar() {
        long ownerId = getCurrentUserId();
        List<Cabin> cabins = cabinRepo.findByOwnerId(ownerId);
        List<Map<String, Object>> reservations = cabins.stream()
                .flatMap(c -> reservationRepo.findByCabinId(c.getId()).stream()
                        .map(r -> {
                            Map<String, Object> map = new java.util.HashMap<>();
                            map.put("id", r.getId());
                            map.put("cabinId", r.getCabinId());
                            map.put("touristId", r.getTouristId());
                            map.put("startDate", r.getStartDate());
                            map.put("endDate", r.getEndDate());
                            map.put("adults", r.getAdults());
                            map.put("children", r.getChildren());
                            map.put("status", r.getStatus());
                            map.put("ownerComment", r.getOwnerComment());
                            map.put("touristNote", r.getTouristNote());
                            map.put("totalPriceRsd", r.getTotalPriceRsd());
                            map.put("cardType", r.getCardType());
                            map.put("cardLast4", r.getCardLast4());
                            map.put("createdAt", r.getCreatedAt());
                            map.put("cabinName", c.getName());
                            Optional<User> tourist = userRepo.findById(r.getTouristId());
                            map.put("touristName", tourist.map(User::getFirstName).orElse("Unknown") + " " + tourist.map(User::getLastName).orElse(""));
                            return map;
                        }))
                .toList();
        return ResponseEntity.ok(reservations);
    }

    @PostMapping("/cabins")
    public ResponseEntity<Cabin> createCabin(@RequestBody Cabin cabin) {
        cabin.setOwnerId(getCurrentUserId());
        
        try {
            Long id = cabinRepo.create(cabin);
            
            if (id != null && id > 0) {
                Cabin created = cabinRepo.findById(id).orElse(null);
                if (created != null) {
                    return ResponseEntity.ok(created);
                }
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/cabins/{id}")
    public ResponseEntity<Cabin> updateCabin(@PathVariable long id, @RequestBody Cabin cabin) {
        long ownerId = getCurrentUserId();
        Cabin existing = cabinRepo.findById(id).orElse(null);
        if (existing == null || existing.getOwnerId() != ownerId) {
            return ResponseEntity.status(403).build();
        }
        
        cabin.setId(id);
        cabin.setOwnerId(ownerId);
        cabinRepo.update(cabin);
        
        Cabin updated = cabinRepo.findById(id).orElseThrow(() -> new RuntimeException("Cabin not found after update"));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/cabins/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteCabin(@PathVariable long id) {
        long ownerId = getCurrentUserId();
        Cabin existing = cabinRepo.findById(id).orElse(null);
        if (existing == null || existing.getOwnerId() != ownerId) {
            return ResponseEntity.status(403).build();
        }
        
        reviewRepo.deleteByCabinId(id);
        reservationRepo.deleteByCabinId(id);
        cabinRepo.softDelete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cabins/{id}/images")
    public ResponseEntity<?> uploadImages(@PathVariable long id, @RequestParam("images") MultipartFile[] files) {
        if (files.length > 6) {
            return ResponseEntity.badRequest().body("Max 6 images");
        }
        for (MultipartFile file : files) {
            try {
                ImageResizeService.ResizedImages resized = imageResizeService.resize(file);
                CabinImage display = new CabinImage();
                display.setCabinId(id);
                display.setVariant("DISPLAY");
                display.setMimeType(file.getContentType());
                display.setWidth(1280);
                display.setHeight(1280);
                display.setData(resized.getDisplay());
                cabinImageRepo.create(display);

                CabinImage thumb = new CabinImage();
                thumb.setCabinId(id);
                thumb.setVariant("THUMB");
                thumb.setMimeType(file.getContentType());
                thumb.setWidth(320);
                thumb.setHeight(320);
                thumb.setData(resized.getThumb());
                cabinImageRepo.create(thumb);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Error processing image");
            }
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long ownerId = getCurrentUserId();
        List<Cabin> cabins = cabinRepo.findByOwnerId(ownerId);

        int totalCabins = cabins.size();

        int activeReservations = cabins.stream()
                .mapToInt(c -> reservationRepo.countActiveByCabinId(c.getId()))
                .sum();

        java.time.LocalDate now = java.time.LocalDate.now();
        java.sql.Date monthStart = java.sql.Date.valueOf(now.withDayOfMonth(1));
        java.sql.Date monthEnd = java.sql.Date.valueOf(now.withDayOfMonth(now.lengthOfMonth()));
        int monthlyRevenue = cabins.stream()
                .mapToInt(c -> reservationRepo.sumRevenueByCabinIdAndPeriod(c.getId(), monthStart, monthEnd))
                .sum();

        double averageRating = cabins.stream()
                .mapToDouble(c -> {
                    Double rating = reservationRepo.getAverageRatingByCabinId(c.getId());
                    return rating != null ? rating : 0.0;
                })
                .average()
                .orElse(0.0);

        Map<String, Object> stats = Map.of(
                "totalCabins", totalCabins,
                "activeReservations", activeReservations,
                "monthlyRevenue", monthlyRevenue,
                "averageRating", averageRating
        );
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/cabins")
    public ResponseEntity<List<Cabin>> getMyCabins() {
        long ownerId = getCurrentUserId();
        List<Cabin> cabins = cabinRepo.findByOwnerId(ownerId);
        return ResponseEntity.ok(cabins);
    }

    @GetMapping("/statistics/monthly-reservations")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyReservations() {
        long ownerId = getCurrentUserId();
        List<Cabin> cabins = cabinRepo.findByOwnerId(ownerId);
        
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        
        for (Cabin cabin : cabins) {
            Map<String, Object> cabinStats = new java.util.HashMap<>();
            cabinStats.put("cabinId", cabin.getId());
            cabinStats.put("cabinName", cabin.getName());
            
            java.time.LocalDate now = java.time.LocalDate.now();
            List<Map<String, Object>> monthlyData = new java.util.ArrayList<>();
            
            for (int i = 11; i >= 0; i--) {
                java.time.LocalDate monthDate = now.minusMonths(i);
                java.time.LocalDate monthStart = monthDate.withDayOfMonth(1);
                java.time.LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
                
                int count = reservationRepo.countReservationsByCabinIdAndPeriod(
                    cabin.getId(), 
                    java.sql.Date.valueOf(monthStart), 
                    java.sql.Date.valueOf(monthEnd),
                    "ACCEPTED"
                );
                
                Map<String, Object> monthData = new java.util.HashMap<>();
                monthData.put("month", monthDate.getMonth().toString());
                monthData.put("year", monthDate.getYear());
                monthData.put("count", count);
                monthlyData.add(monthData);
            }
            
            cabinStats.put("monthlyData", monthlyData);
            result.add(cabinStats);
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/statistics/weekend-vs-weekday")
    public ResponseEntity<List<Map<String, Object>>> getWeekendVsWeekday() {
        long ownerId = getCurrentUserId();
        List<Cabin> cabins = cabinRepo.findByOwnerId(ownerId);
        
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        
        for (Cabin cabin : cabins) {
            List<Reservation> reservations = reservationRepo.findByCabinId(cabin.getId()).stream()
                .filter(r -> "ACCEPTED".equals(r.getStatus()))
                .toList();
            
            int weekendCount = 0;
            int weekdayCount = 0;
            
            for (Reservation res : reservations) {
                java.time.LocalDate start = res.getStartDate().toLocalDate();
                
                java.time.DayOfWeek dayOfWeek = start.getDayOfWeek();
                if (dayOfWeek == java.time.DayOfWeek.SATURDAY || dayOfWeek == java.time.DayOfWeek.SUNDAY) {
                    weekendCount++;
                } else {
                    weekdayCount++;
                }
            }
            
            Map<String, Object> cabinStats = new java.util.HashMap<>();
            cabinStats.put("cabinId", cabin.getId());
            cabinStats.put("cabinName", cabin.getName());
            cabinStats.put("weekendCount", weekendCount);
            cabinStats.put("weekdayCount", weekdayCount);
            
            result.add(cabinStats);
        }
        
        return ResponseEntity.ok(result);
    }

    private long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepo.findByUsername(username).map(User::getId).orElseThrow(() -> new RuntimeException("User not found"));
    }
}