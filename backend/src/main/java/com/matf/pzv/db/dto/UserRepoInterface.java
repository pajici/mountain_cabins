package com.matf.pzv.db.dto;

import com.matf.pzv.models.User;
import java.util.List;
import java.util.Optional;

public interface UserRepoInterface {
    Optional<User> findByUsername(String username);
    Optional<User> findById(long id);
    boolean usernameExists(String username);
    boolean emailExists(String email);
    Long create(User u);
    void update(User u);
    void updatePassword(long id, String passwordHash);
    void deactivate(long id);
    void activate(long id);
    List<User> findAll(String q);
    int countAll();
    int countByRole(String role);
}