package com.matf.pzv.controllers;

import com.matf.pzv.db.dto.RegistrationRequestRepoInterface;
import com.matf.pzv.db.dto.BannedIdentifierRepoInterface;
import com.matf.pzv.db.dto.UserRepoInterface;
import com.matf.pzv.models.RegistrationRequest;
import com.matf.pzv.services.ImageResizeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationRequestRepoInterface registrationRequestRepo;
    private final BannedIdentifierRepoInterface bannedIdentifierRepo;
    private final UserRepoInterface userRepo;
    private final PasswordEncoder passwordEncoder;
    private final ImageResizeService imageResizeService;

    public RegistrationController(RegistrationRequestRepoInterface registrationRequestRepo,
                                  BannedIdentifierRepoInterface bannedIdentifierRepo,
                                  UserRepoInterface userRepo,
                                  PasswordEncoder passwordEncoder,
                                  ImageResizeService imageResizeService) {
        this.registrationRequestRepo = registrationRequestRepo;
        this.bannedIdentifierRepo = bannedIdentifierRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.imageResizeService = imageResizeService;
    }

    @PostMapping
    public ResponseEntity<?> register(@RequestParam("username") String username,
                                      @RequestParam("email") String email,
                                      @RequestParam("role") String role,
                                      @RequestParam("firstName") String firstName,
                                      @RequestParam("lastName") String lastName,
                                      @RequestParam("gender") String gender,
                                      @RequestParam("address") String address,
                                      @RequestParam("phone") String phone,
                                      @RequestParam("password") String password,
                                      @RequestParam("cardNumber") String cardNumber,
                                      @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {
        try {
            if (bannedIdentifierRepo.isBanned("USERNAME", username) ||
                bannedIdentifierRepo.isBanned("EMAIL", email)) {
                return ResponseEntity.badRequest().body("Registration not allowed");
            }
            if (userRepo.usernameExists(username) || userRepo.emailExists(email)) {
                return ResponseEntity.badRequest().body("Username or email already in use");
            }
            if (!password.matches("^(?=.*[a-z]{3})(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,10}$") || !password.matches("^[a-zA-Z].*")) {
                return ResponseEntity.badRequest().body("Invalid password format");
            }
            String cardType = validateCard(cardNumber);
            if (cardType == null) {
                return ResponseEntity.badRequest().body("Invalid card number");
            }
            String cardLast4 = cardNumber.substring(cardNumber.length() - 4);

            byte[] imageData = null;
            if (profileImage != null && !profileImage.isEmpty()) {
                if (profileImage.getSize() > 2 * 1024 * 1024) { // 2MB
                    return ResponseEntity.badRequest().body("Image too large");
                }
                String contentType = profileImage.getContentType();
                if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
                    return ResponseEntity.badRequest().body("Invalid image format");
                }
                ImageResizeService.ResizedImages resized = imageResizeService.resize(profileImage);
                imageData = resized.getThumb();
            } else {
                try {
                    java.io.InputStream defaultImageStream = getClass().getClassLoader().getResourceAsStream("static/default-avatar.png");
                    if (defaultImageStream != null) {
                        imageData = defaultImageStream.readAllBytes();
                        defaultImageStream.close();
                    }
                } catch (Exception e) {
                }
            }

            RegistrationRequest req = new RegistrationRequest();
            req.setUsername(username);
            req.setEmail(email);
            req.setRole(role);
            req.setFirstName(firstName);
            req.setLastName(lastName);
            req.setGender(gender);
            req.setAddress(address);
            req.setPhone(phone);
            req.setPassword(passwordEncoder.encode(password));
            req.setCardType(cardType);
            req.setCardLast4(cardLast4);
            req.setProfileImage(imageData);
            req.setStatus("PENDING");

            Long id = registrationRequestRepo.create(req);
            if (id != null) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().body("Failed to create registration request");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    private String validateCard(String cardNumber) {
        cardNumber = cardNumber.replaceAll("\\s", "");
        if (!cardNumber.matches("\\d+")) return null;
        if (cardNumber.startsWith("300") || cardNumber.startsWith("301") || cardNumber.startsWith("302") ||
            cardNumber.startsWith("303") || cardNumber.startsWith("36") || cardNumber.startsWith("38")) {
            return cardNumber.length() == 15 ? "DINERS" : null;
        } else if (cardNumber.startsWith("51") || cardNumber.startsWith("52") || cardNumber.startsWith("53") ||
                   cardNumber.startsWith("54") || cardNumber.startsWith("55")) {
            return cardNumber.length() == 16 ? "MASTERCARD" : null;
        } else if (cardNumber.startsWith("4539") || cardNumber.startsWith("4556") || cardNumber.startsWith("4916") ||
                   cardNumber.startsWith("4532") || cardNumber.startsWith("4929") || cardNumber.startsWith("4485") ||
                   cardNumber.startsWith("4716")) {
            return cardNumber.length() == 16 ? "VISA" : null;
        }
        return null;
    }
}