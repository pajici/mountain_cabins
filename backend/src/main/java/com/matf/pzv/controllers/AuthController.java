package com.matf.pzv.controllers;

import com.matf.pzv.db.dto.UserRepoInterface;
import com.matf.pzv.db.dto.CabinImageRepoInterface;
import com.matf.pzv.models.User;
import com.matf.pzv.models.CabinImage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserRepoInterface userRepo;
    private final PasswordEncoder passwordEncoder;
    private final CabinImageRepoInterface cabinImageRepo;

    public AuthController(UserRepoInterface userRepo, PasswordEncoder passwordEncoder, CabinImageRepoInterface cabinImageRepo) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.cabinImageRepo = cabinImageRepo;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).build();
        }
        String username = auth.getName();
        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userOpt.get());
    }

    @PostMapping("/password/change")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        String confirmPassword = body.get("confirmPassword");
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            return ResponseEntity.badRequest().body("Old password incorrect");
        }
        if (newPassword.equals(oldPassword)) {
            return ResponseEntity.badRequest().body("New password must be different from old");
        }
        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body("New passwords do not match");
        }
        if (!newPassword.matches("^(?=.*[a-z]{3})(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,10}$") || !newPassword.matches("^[a-zA-Z].*")) {
            return ResponseEntity.badRequest().body("Invalid new password format");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.updatePassword(user.getId(), user.getPasswordHash());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userOpt.get());
    }

    @Transactional
    @PutMapping(value = "/profile", consumes = "application/json")
    public ResponseEntity<?> updateProfileJson(@RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        logger.info("Updating profile (JSON) for user: {}", username);
        logger.info("Received JSON data: {}", body);
        
        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            logger.error("User not found: {}", username);
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        logger.debug("User before update: firstName={}, lastName={}", user.getFirstName(), user.getLastName());

        if (body.get("firstName") != null) user.setFirstName(body.get("firstName"));
        if (body.get("lastName") != null) user.setLastName(body.get("lastName"));
        if (body.get("gender") != null) user.setGender(body.get("gender"));
        if (body.get("address") != null) user.setAddress(body.get("address"));
        if (body.get("phone") != null) user.setPhone(body.get("phone"));
        if (body.get("email") != null) user.setEmail(body.get("email"));

        logger.debug("User after setters: firstName={}, lastName={}", user.getFirstName(), user.getLastName());
        userRepo.update(user);
        logger.info("Profile updated successfully (JSON) for user: {}", username);
        
        return ResponseEntity.ok().build();
    }

    @Transactional
    @PutMapping(value = "/profile", consumes = "multipart/form-data")
    public ResponseEntity<?> updateProfileWithImage(
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        logger.info("Updating profile (multipart) for user: {}", username);
        logger.info("Received params: firstName={}, lastName={}, gender={}, address={}, phone={}, email={}, hasImage={}", 
            firstName, lastName, gender, address, phone, email, profileImage != null && !profileImage.isEmpty());
        
        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            logger.error("User not found: {}", username);
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        logger.debug("User before update: firstName={}, lastName={}", user.getFirstName(), user.getLastName());

        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (gender != null) user.setGender(gender);
        if (address != null) user.setAddress(address);
        if (phone != null) user.setPhone(phone);
        if (email != null) user.setEmail(email);

        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                CabinImage image = new CabinImage();
                image.setCabinId(null);
                image.setVariant("PROFILE");
                image.setMimeType(profileImage.getContentType());
                image.setWidth(100);
                image.setHeight(100);
                image.setData(profileImage.getBytes());
                Long imageId = cabinImageRepo.create(image);
                user.setProfileImageId(imageId);
                logger.info("Profile image saved with ID: {}", imageId);
            } catch (Exception e) {
                logger.error("Failed to save profile image", e);
                return ResponseEntity.badRequest().body("Failed to save profile image");
            }
        }

        logger.debug("User after setters: firstName={}, lastName={}", user.getFirstName(), user.getLastName());
        userRepo.update(user);
        logger.info("Profile updated successfully (multipart) for user: {}", username);
        
        return ResponseEntity.ok().build();
    }
}