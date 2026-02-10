package com.matf.pzv.models;

public class User {
    private Long id;
    private String username;
    private String passwordHash;
    private String firstName;
    private String lastName;
    private String gender;
    private String address;
    private String phone;
    private String email;
    private String role;
    private boolean active;
    private boolean deleted;
    private java.sql.Timestamp blockedUntil;
    private Long profileImageId;
    private java.sql.Timestamp createdAt;
    private java.sql.Timestamp updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public java.sql.Timestamp getBlockedUntil() { return blockedUntil; }
    public void setBlockedUntil(java.sql.Timestamp blockedUntil) { this.blockedUntil = blockedUntil; }

    public Long getProfileImageId() { return profileImageId; }
    public void setProfileImageId(Long profileImageId) { this.profileImageId = profileImageId; }

    public java.sql.Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.sql.Timestamp createdAt) { this.createdAt = createdAt; }

    public java.sql.Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.sql.Timestamp updatedAt) { this.updatedAt = updatedAt; }
}