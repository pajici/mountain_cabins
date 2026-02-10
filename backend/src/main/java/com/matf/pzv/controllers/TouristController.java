package com.matf.pzv.controllers;

import com.matf.pzv.db.dto.CabinRepoInterface;
import com.matf.pzv.db.dto.ReservationRepoInterface;
import com.matf.pzv.db.dto.ReviewRepoInterface;
import com.matf.pzv.db.dto.UserRepoInterface;
import com.matf.pzv.models.Cabin;
import com.matf.pzv.models.Reservation;
import com.matf.pzv.models.Review;
import com.matf.pzv.models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tourist")
public class TouristController {

    private final ReservationRepoInterface reservationRepo;
    private final ReviewRepoInterface reviewRepo;
    private final UserRepoInterface userRepo;
    private final CabinRepoInterface cabinRepo;

    public TouristController(ReservationRepoInterface reservationRepo, ReviewRepoInterface reviewRepo,
                             UserRepoInterface userRepo, CabinRepoInterface cabinRepo) {
        this.reservationRepo = reservationRepo;
        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
        this.cabinRepo = cabinRepo;
    }

    @GetMapping("/reservations/current")
    public ResponseEntity<List<Reservation>> getCurrentReservations() {
        long touristId = getCurrentUserId();
        List<Reservation> reservations = reservationRepo.findCurrentByTouristId(touristId);
        for (Reservation r : reservations) {
            Cabin cabin = cabinRepo.findById(r.getCabinId()).orElse(null);
            if (cabin != null) {
                r.setCabinName(cabin.getName());
                r.setCabinLocation(cabin.getPlace());
            }
        }
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/last-used-card")
    public ResponseEntity<?> getLastUsedCard() {
        long touristId = getCurrentUserId();
        List<Reservation> allReservations = reservationRepo.findAllByTouristId(touristId);
        
        Reservation lastWithCard = null;
        for (Reservation r : allReservations) {
            if (r.getCardType() != null && r.getCardLast4() != null) {
                if (lastWithCard == null || r.getCreatedAt().after(lastWithCard.getCreatedAt())) {
                    lastWithCard = r;
                }
            }
        }
        
        if (lastWithCard != null) {
            Map<String, String> cardInfo = Map.of(
                "cardType", lastWithCard.getCardType(),
                "cardLast4", lastWithCard.getCardLast4()
            );
            return ResponseEntity.ok(cardInfo);
        }
        
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reservations/archive")
    public ResponseEntity<List<Reservation>> getArchiveReservations() {
        long touristId = getCurrentUserId();
        List<Reservation> reservations = reservationRepo.findArchiveByTouristId(touristId);
        for (Reservation r : reservations) {
            Cabin cabin = cabinRepo.findById(r.getCabinId()).orElse(null);
            if (cabin != null) {
                r.setCabinName(cabin.getName());
                r.setCabinLocation(cabin.getPlace());
            }
            List<com.matf.pzv.models.Review> reviews = reviewRepo.findByReservationId(r.getId());
            r.setIsReviewed(!reviews.isEmpty());
        }
        return ResponseEntity.ok(reservations);
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable long id) {
        long touristId = getCurrentUserId();
        Optional<Reservation> reservationOpt = reservationRepo.findById(id);
        if (reservationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Reservation reservation = reservationOpt.get();
        if (reservation.getTouristId() != touristId) {
            return ResponseEntity.badRequest().body("Reservation not found");
        }
        
        if (!"PENDING".equals(reservation.getStatus()) && !"ACCEPTED".equals(reservation.getStatus())) {
            return ResponseEntity.badRequest().body("Cannot cancel reservation with status: " + reservation.getStatus());
        }
        
        java.sql.Date today = new java.sql.Date(System.currentTimeMillis());
        java.sql.Date oneDayBefore = new java.sql.Date(today.getTime() + 24 * 60 * 60 * 1000);
        if (reservation.getStartDate().before(oneDayBefore)) {
            return ResponseEntity.badRequest().body("Reservation can only be cancelled at least 24 hours before start date");
        }
        
        reservationRepo.updateStatus(id, "CANCELLED", null);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> body) {
        long reservationId = ((Number) body.get("reservationId")).longValue();
        double rating = ((Number) body.get("rating")).doubleValue();
        String comment = (String) body.get("comment");

        Optional<Reservation> reservationOpt = reservationRepo.findById(reservationId);
        if (reservationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Reservation reservation = reservationOpt.get();
        if (reservation.getTouristId() != getCurrentUserId()) {
            return ResponseEntity.badRequest().body("Reservation not found");
        }

        if (!"ACCEPTED".equals(reservation.getStatus())) {
            return ResponseEntity.badRequest().body("Can only review accepted reservations");
        }

        java.sql.Date today = new java.sql.Date(System.currentTimeMillis());
        if (reservation.getEndDate().after(today)) {
            return ResponseEntity.badRequest().body("Cannot review before stay ends");
        }

        if (!reviewRepo.findByReservationId(reservationId).isEmpty()) {
            return ResponseEntity.badRequest().body("Already reviewed");
        }

        Review review = new Review();
        review.setReservationId(reservationId);
        review.setRating(java.math.BigDecimal.valueOf(rating));
        review.setComment(comment);

        reviewRepo.create(review);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reservations")
    public ResponseEntity<?> createReservation(@RequestBody Map<String, Object> body) {
        long cabinId = ((Number) body.get("cabinId")).longValue();
        String startDateStr = (String) body.get("startDate");
        String endDateStr = (String) body.get("endDate");
        int adults = ((Number) body.get("adults")).intValue();
        int children = ((Number) body.get("children")).intValue();
        String cardNumber = (String) body.get("cardNumber");
        String touristNote = (String) body.get("touristNote");

        java.sql.Date startDate = java.sql.Date.valueOf(startDateStr);
        java.sql.Date endDate = java.sql.Date.valueOf(endDateStr);

        if (startDate.after(endDate) || startDate.equals(endDate)) {
            return ResponseEntity.badRequest().body("Invalid dates");
        }

        long touristId = getCurrentUserId();

        Cabin cabin = cabinRepo.findById(cabinId).orElse(null);
        if (cabin == null) {
            return ResponseEntity.badRequest().body("Cabin not found");
        }

        if (cabin.getBlockedUntil() != null && cabin.getBlockedUntil().after(startDate)) {
            return ResponseEntity.badRequest().body("Cabin is temporarily blocked and not available for reservations");
        }

        if (reservationRepo.hasConflict(cabinId, startDate, endDate)) {
            return ResponseEntity.badRequest().body("Cabin not available for selected dates");
        }

        int month = startDate.toLocalDate().getMonthValue();
        boolean isSummer = month >= 5 && month <= 8;
        int pricePerNight = isSummer ? cabin.getPriceSummerRsd() : cabin.getPriceWinterRsd();
        long nights = java.time.temporal.ChronoUnit.DAYS.between(startDate.toLocalDate(), endDate.toLocalDate());
        int totalPrice = (int) (nights * pricePerNight);

        String cardType;
        String cardLast4;
        
        String cleanCard = cardNumber.replaceAll("\\s", "");
        if (cleanCard.matches("\\*{12}\\d{4}")) {
            cardLast4 = cleanCard.substring(12);
            List<Reservation> previousReservations = reservationRepo.findAllByTouristId(touristId);
            cardType = null;
            for (Reservation prev : previousReservations) {
                if (prev.getCardLast4() != null && prev.getCardLast4().equals(cardLast4)) {
                    cardType = prev.getCardType();
                    break;
                }
            }
            if (cardType == null) {
                cardType = "UNKNOWN";
            }
        } else {
            cardType = validateCard(cardNumber);
            if (cardType == null) {
                return ResponseEntity.badRequest().body("Invalid card");
            }
            cardLast4 = cardNumber.substring(cardNumber.length() - 4);
        }

        Reservation r = new Reservation();
        r.setCabinId(cabinId);
        r.setTouristId(touristId);
        r.setStartDate(startDate);
        r.setEndDate(endDate);
        r.setAdults(adults);
        r.setChildren(children);
        r.setTotalPriceRsd(totalPrice);
        r.setCardType(cardType);
        r.setCardLast4(cardLast4);
        r.setTouristNote(touristNote);
        r.setStatus("PENDING");

        Long id = reservationRepo.create(r);
        return id != null ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    private String validateCard(String cardNumber) {
        cardNumber = cardNumber.replaceAll("\\s", "");
        if (!cardNumber.matches("\\d+")) return null;
        
        if (cardNumber.startsWith("300") || cardNumber.startsWith("301") || cardNumber.startsWith("302") ||
            cardNumber.startsWith("303") || cardNumber.startsWith("304") || cardNumber.startsWith("305") ||
            cardNumber.startsWith("36") || cardNumber.startsWith("38")) {
            return (cardNumber.length() == 14 || cardNumber.length() == 15) ? "DINERS" : null;
        } 
        else if (cardNumber.startsWith("51") || cardNumber.startsWith("52") || cardNumber.startsWith("53") ||
                 cardNumber.startsWith("54") || cardNumber.startsWith("55") || 
                 (cardNumber.length() >= 4 && Integer.parseInt(cardNumber.substring(0, 4)) >= 2221 && 
                  Integer.parseInt(cardNumber.substring(0, 4)) <= 2720)) {
            return cardNumber.length() == 16 ? "MASTERCARD" : null;
        } 
        else if (cardNumber.startsWith("4")) {
            return (cardNumber.length() == 13 || cardNumber.length() == 16 || cardNumber.length() == 19) ? "VISA" : null;
        }
        else if (cardNumber.startsWith("34") || cardNumber.startsWith("37")) {
            return cardNumber.length() == 15 ? "AMEX" : null;
        }
        
        return null;
    }

    private long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepo.findByUsername(username).map(User::getId).orElseThrow(() -> new RuntimeException("User not found"));
    }
}