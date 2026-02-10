package com.matf.pzv.controllers;

import com.matf.pzv.db.dto.*;
import com.matf.pzv.models.BannedIdentifier;
import com.matf.pzv.models.RegistrationRequest;
import com.matf.pzv.models.User;
import com.matf.pzv.models.Cabin;
import com.matf.pzv.models.CabinImage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepoInterface userRepo;
    private final RegistrationRequestRepoInterface registrationRequestRepo;
    private final BannedIdentifierRepoInterface bannedIdentifierRepo;
    private final CabinRepoInterface cabinRepo;
    private final ReservationRepoInterface reservationRepo;
    private final ReviewRepoInterface reviewRepo;
    private final CabinImageRepoInterface cabinImageRepo;

    public AdminController(UserRepoInterface userRepo, RegistrationRequestRepoInterface registrationRequestRepo,
                           BannedIdentifierRepoInterface bannedIdentifierRepo, CabinRepoInterface cabinRepo,
                           ReservationRepoInterface reservationRepo, ReviewRepoInterface reviewRepo,
                           CabinImageRepoInterface cabinImageRepo) {
        this.userRepo = userRepo;
        this.registrationRequestRepo = registrationRequestRepo;
        this.bannedIdentifierRepo = bannedIdentifierRepo;
        this.cabinRepo = cabinRepo;
        this.reservationRepo = reservationRepo;
        this.reviewRepo = reviewRepo;
        this.cabinImageRepo = cabinImageRepo;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> listUsers(@RequestParam(required = false) String q) {
        List<User> users = userRepo.findAll(q);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable long id, @RequestBody User user) {
        Optional<User> existingUserOpt = userRepo.findById(id);
        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User existingUser = existingUserOpt.get();
        
        if (user.getUsername() != null && !user.getUsername().trim().isEmpty()) {
            existingUser.setUsername(user.getUsername());
        }
        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            existingUser.setEmail(user.getEmail());
        }
        if (user.getFirstName() != null && !user.getFirstName().trim().isEmpty()) {
            existingUser.setFirstName(user.getFirstName());
        }
        if (user.getLastName() != null && !user.getLastName().trim().isEmpty()) {
            existingUser.setLastName(user.getLastName());
        }
        if (user.getRole() != null) {
            if ("ADMIN".equals(user.getRole())) {
                return ResponseEntity.badRequest().body("Nije dozvoljeno postavljanje ADMIN uloge.");
            }
            if (!"TOURIST".equals(user.getRole()) && !"OWNER".equals(user.getRole())) {
                return ResponseEntity.badRequest().body("Dozvoljena uloga može biti samo TOURIST ili OWNER.");
            }
            existingUser.setRole(user.getRole());
        }
        if (user.getPhone() != null) {
            existingUser.setPhone(user.getPhone());
        }
        if (user.getAddress() != null) {
            existingUser.setAddress(user.getAddress());
        }
        if (user.getGender() != null) {
            existingUser.setGender(user.getGender());
        }
        existingUser.setActive(user.isActive());
        
        try {
            userRepo.update(existingUser);
            User updatedUser = userRepo.findById(id).orElse(existingUser);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Greška pri ažuriranju korisnika: " + e.getMessage());
        }
    }

    @PatchMapping("/users/{id}/change-role")
    public ResponseEntity<?> changeUserRole(@PathVariable long id, @RequestBody java.util.Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null || (!newRole.equals("ADMIN") && !newRole.equals("OWNER") && !newRole.equals("TOURIST"))) {
            return ResponseEntity.badRequest().body("Nevažeća uloga");
        }
        
        if ("ADMIN".equals(newRole)) {
            return ResponseEntity.badRequest().body("Nije dozvoljeno postavljanje više administratora. Samo jedan admin sme da postoji u sistemu.");
        }
        
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.badRequest().body("Nije dozvoljeno menjanje uloge administratora.");
        }
        
        user.setRole(newRole);
        
        try {
            userRepo.update(user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Greška pri promeni uloge: " + e.getMessage());
        }
    }

    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable long id) {
        try {
            Optional<User> userOpt = userRepo.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            if ("ADMIN".equals(user.getRole())) {
                return ResponseEntity.badRequest().body("Nije dozvoljeno deaktiviranje administratora.");
            }
            
            userRepo.deactivate(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Greška pri deaktivaciji korisnika: " + e.getMessage());
        }
    }

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<?> activateUser(@PathVariable long id) {
        try {
            Optional<User> userOpt = userRepo.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            userRepo.activate(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Greška pri aktivaciji korisnika: " + e.getMessage());
        }
    }

    @GetMapping("/registrations")
    public ResponseEntity<List<RegistrationRequest>> listRegistrations() {
        List<RegistrationRequest> requests = registrationRequestRepo.findAllPending();
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/registrations/{id}/approve")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> approveRegistration(@PathVariable long id) {
        Optional<RegistrationRequest> reqOpt = registrationRequestRepo.findById(id);
        if (reqOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        RegistrationRequest req = reqOpt.get();
        
        if (userRepo.usernameExists(req.getUsername())) {
            return ResponseEntity.badRequest().body("Korisničko ime već postoji");
        }
        if (userRepo.emailExists(req.getEmail())) {
            return ResponseEntity.badRequest().body("Email već postoji");
        }
        
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPasswordHash(req.getPassword());
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setGender(req.getGender());
        user.setAddress(req.getAddress());
        user.setPhone(req.getPhone());
        user.setEmail(req.getEmail());
        user.setRole(req.getRole());
        user.setActive(true);
        
        if (req.getProfileImage() != null && req.getProfileImage().length > 0) {
            CabinImage image = new CabinImage();
            image.setCabinId(null);
            image.setVariant("PROFILE");
            image.setMimeType("image/jpeg");
            image.setWidth(100);
            image.setHeight(100);
            image.setData(req.getProfileImage());
            Long imageId = cabinImageRepo.create(image);
            user.setProfileImageId(imageId);
        }
        
        try {
            Long userId = userRepo.create(user);
            if (userId != null) {
                registrationRequestRepo.updateStatus(id, "APPROVED");
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.badRequest().body("Greška pri kreiranju korisnika");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Greška pri kreiranju korisnika: " + e.getMessage());
        }
    }

    @PostMapping("/registrations/{id}/reject")
    public ResponseEntity<?> rejectRegistration(@PathVariable long id) {
        Optional<RegistrationRequest> reqOpt = registrationRequestRepo.findById(id);
        if (reqOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        RegistrationRequest req = reqOpt.get();
        
        try {
            BannedIdentifier banUsername = new BannedIdentifier();
            banUsername.setType("USERNAME");
            banUsername.setValue(req.getUsername());
            bannedIdentifierRepo.create(banUsername);

            BannedIdentifier banEmail = new BannedIdentifier();
            banEmail.setType("EMAIL");
            banEmail.setValue(req.getEmail());
            bannedIdentifierRepo.create(banEmail);

            registrationRequestRepo.updateStatus(id, "REJECTED");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Greška pri odbijanju registracije: " + e.getMessage());
        }
    }

    @GetMapping("/cabins")
    public ResponseEntity<List<java.util.Map<String, Object>>> listAllCabins() {
        List<Cabin> cabins = cabinRepo.findAllForAdmin();
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        
        for (Cabin cabin : cabins) {
            User owner = userRepo.findById(cabin.getOwnerId()).orElse(null);
            String ownerName = owner != null ? owner.getFirstName() + " " + owner.getLastName() : "Nepoznato";
            
            String status = "ACTIVE";
            if (cabin.getBlockedUntil() != null && cabin.getBlockedUntil().after(new Timestamp(System.currentTimeMillis()))) {
                status = "BLOCKED";
            }
            
            java.util.Map<String, Object> cabinData = new java.util.HashMap<>();
            cabinData.put("id", cabin.getId());
            cabinData.put("name", cabin.getName());
            cabinData.put("place", cabin.getPlace());
            cabinData.put("ownerName", ownerName);
            cabinData.put("ownerId", cabin.getOwnerId());
            cabinData.put("status", status);
            cabinData.put("priceSummerRsd", cabin.getPriceSummerRsd());
            cabinData.put("priceWinterRsd", cabin.getPriceWinterRsd());
            cabinData.put("phone", cabin.getPhone() != null ? cabin.getPhone() : "");
            cabinData.put("blockedUntil", cabin.getBlockedUntil() != null ? cabin.getBlockedUntil().toString() : null);
            
            double avgRating = reviewRepo.getAverageRating(cabin.getId());
            cabinData.put("averageRating", avgRating);
            
            List<java.math.BigDecimal> lastThreeRatings = reviewRepo.getLastThreeRatings(cabin.getId());
            boolean hasLowRatings = false;
            if (lastThreeRatings.size() == 3) {
                hasLowRatings = lastThreeRatings.stream()
                    .allMatch(rating -> rating.compareTo(java.math.BigDecimal.valueOf(2.0)) < 0);
            }
            cabinData.put("hasLowRatings", hasLowRatings);
            cabinData.put("lastThreeRatings", lastThreeRatings);
            
            result.add(cabinData);
        }
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/cabins/{id}/block-48h")
    public ResponseEntity<?> blockCabin(@PathVariable long id) {
        List<java.math.BigDecimal> lastThreeRatings = reviewRepo.getLastThreeRatings(id);
        
        if (lastThreeRatings.size() < 3) {
            return ResponseEntity.badRequest().body(
                java.util.Map.of(
                    "error", "Vikendica mora imati najmanje 3 ocene da bi mogla biti blokirana.",
                    "ratingsCount", lastThreeRatings.size()
                )
            );
        }
        
        boolean allLowRatings = lastThreeRatings.stream()
            .allMatch(rating -> rating.compareTo(java.math.BigDecimal.valueOf(2.0)) < 0);
        
        if (!allLowRatings) {
            return ResponseEntity.badRequest().body(
                java.util.Map.of(
                    "error", "Samo vikendice sa poslednje 3 ocene manje od 2.0 mogu biti blokirane.",
                    "lastThreeRatings", lastThreeRatings
                )
            );
        }
        
        Timestamp until = Timestamp.valueOf(LocalDateTime.now().plusHours(48));
        cabinRepo.block(id, until);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cabins/{id}/unblock")
    public ResponseEntity<?> unblockCabin(@PathVariable long id) {
        cabinRepo.block(id, null);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/kpi")
    public ResponseEntity<java.util.Map<String, Object>> getKPI() {
        int totalUsers = userRepo.countAll();
        int totalCabins = cabinRepo.countAll();
        int totalReservations = reservationRepo.countAll();
        int pendingRegistrations = registrationRequestRepo.countPending();
        int monthlyRevenue = reservationRepo.sumMonthlyRevenue();
        int activeCabins = cabinRepo.countActive();

        java.util.Map<String, Object> kpi = java.util.Map.of(
                "totalUsers", totalUsers,
                "totalCabins", totalCabins,
                "totalReservations", totalReservations,
                "pendingRegistrations", pendingRegistrations,
                "monthlyRevenue", monthlyRevenue,
                "activeCabins", activeCabins
        );
        return ResponseEntity.ok(kpi);
    }
}