package com.matf.pzv.controllers;

import com.matf.pzv.db.dto.CabinRepoInterface;
import com.matf.pzv.db.dto.ReservationRepoInterface;
import com.matf.pzv.db.dto.ReviewRepoInterface;
import com.matf.pzv.db.dto.UserRepoInterface;
import com.matf.pzv.db.dto.CabinImageRepoInterface;
import com.matf.pzv.models.Cabin;
import com.matf.pzv.models.Review;
import com.matf.pzv.models.CabinImage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final CabinRepoInterface cabinRepo;
    private final ReservationRepoInterface reservationRepo;
    private final ReviewRepoInterface reviewRepo;
    private final UserRepoInterface userRepo;
    private final CabinImageRepoInterface cabinImageRepo;

    public PublicController(CabinRepoInterface cabinRepo, ReservationRepoInterface reservationRepo, ReviewRepoInterface reviewRepo, UserRepoInterface userRepo, CabinImageRepoInterface cabinImageRepo) {
        this.cabinRepo = cabinRepo;
        this.reservationRepo = reservationRepo;
        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
        this.cabinImageRepo = cabinImageRepo;
    }

    @GetMapping("/kpi")
    public ResponseEntity<Map<String, Integer>> getKpi() {
        int last24h = reservationRepo.countConfirmedInLastHours(24);
        int last7d = reservationRepo.countConfirmedInLastHours(168);
        int last30d = reservationRepo.countConfirmedInLastHours(720);
        int totalCabins = cabinRepo.countAll();
        int totalOwners = userRepo.countByRole("OWNER");
        int totalTourists = userRepo.countByRole("TOURIST");

        return ResponseEntity.ok(Map.of(
            "confirmedReservations24h", last24h,
            "confirmedReservations7d", last7d,
            "confirmedReservations30d", last30d,
            "totalCabins", totalCabins,
            "totalOwners", totalOwners,
            "totalTourists", totalTourists
        ));
    }

    @GetMapping("/cabins")
    public ResponseEntity<List<Map<String, Object>>> getCabins(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        List<Cabin> cabins = cabinRepo.findAll(q, offset, limit);
        List<Map<String, Object>> result = cabins.stream().map(cabin -> {
            double avgRating = reviewRepo.getAverageRating(cabin.getId());
            List<Long> thumbIds = cabinImageRepo.findByCabinId(cabin.getId()).stream()
                    .filter(ci -> "THUMB".equals(ci.getVariant()) || "DISPLAY".equals(ci.getVariant()))
                    .map(CabinImage::getId)
                    .limit(1)
                    .toList();
            
            String ownerName = userRepo.findById(cabin.getOwnerId())
                    .map(user -> user.getFirstName() + " " + user.getLastName())
                    .orElse("Nepoznato");
            
            String status = (cabin.getBlockedUntil() == null || cabin.getBlockedUntil().before(new java.sql.Timestamp(System.currentTimeMillis()))) 
                    ? "ACTIVE" : "BLOCKED";
            
            int totalReservations = reservationRepo.countByCabinId(cabin.getId());
            
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("cabin", cabin);
            map.put("averageRating", avgRating);
            map.put("thumbnail", thumbIds.isEmpty() ? null : thumbIds.get(0));
            map.put("ownerName", ownerName);
            map.put("status", status);
            map.put("totalReservations", totalReservations);
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/cabins/available")
    public ResponseEntity<List<Map<String, Object>>> getAvailableCabins(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        List<Cabin> cabins = cabinRepo.findAll(q, offset, limit);
        java.sql.Date requestStartDate = java.sql.Date.valueOf(startDate);
        java.sql.Timestamp requestStartTimestamp = new java.sql.Timestamp(requestStartDate.getTime());
        
        List<Cabin> availableCabins = cabins.stream()
                .filter(cabin -> cabin.getBlockedUntil() == null || cabin.getBlockedUntil().before(requestStartTimestamp))
                .filter(cabin -> !reservationRepo.hasConflict(cabin.getId(), java.sql.Date.valueOf(startDate), java.sql.Date.valueOf(endDate)))
                .toList();
        List<Map<String, Object>> result = availableCabins.stream().map(cabin -> {
            double avgRating = reviewRepo.getAverageRating(cabin.getId());
            List<Long> thumbIds = cabinImageRepo.findByCabinId(cabin.getId()).stream()
                    .filter(ci -> "THUMB".equals(ci.getVariant()) || "DISPLAY".equals(ci.getVariant()))
                    .map(CabinImage::getId)
                    .limit(1)
                    .toList();
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("cabin", cabin);
            map.put("averageRating", avgRating);
            map.put("thumbnail", thumbIds.isEmpty() ? null : thumbIds.get(0));
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/cabins/{id}")
    public ResponseEntity<Map<String, Object>> getCabin(@PathVariable long id) {
        return cabinRepo.findById(id)
                .map(cabin -> {
                    double avgRating = reviewRepo.getAverageRating(id);
                    List<Review> reviews = reservationRepo.findByCabinId(id).stream()
                            .filter(r -> "ACCEPTED".equals(r.getStatus()))
                            .flatMap(r -> reviewRepo.findByReservationId(r.getId()).stream())
                            .toList();
                    List<Long> imageIds = cabinImageRepo.findByCabinId(id).stream()
                            .filter(ci -> "DISPLAY".equals(ci.getVariant()))
                            .map(CabinImage::getId)
                            .toList();
                    Map<String, Object> result = new java.util.HashMap<>();
                    result.put("cabin", cabin);
                    result.put("averageRating", avgRating);
                    result.put("reviews", reviews);
                    result.put("images", imageIds);
                    return ResponseEntity.ok(result);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/images/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable long id) {
        return cabinImageRepo.findById(id)
                .map(image -> ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.parseMediaType(image.getMimeType()))
                        .body(image.getData()))
                .orElse(ResponseEntity.notFound().build());
    }
}