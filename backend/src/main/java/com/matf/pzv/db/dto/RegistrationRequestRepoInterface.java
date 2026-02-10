package com.matf.pzv.db.dto;

import com.matf.pzv.models.RegistrationRequest;
import java.util.List;
import java.util.Optional;

public interface RegistrationRequestRepoInterface {
    List<RegistrationRequest> findAllPending();
    Optional<RegistrationRequest> findById(long id);
    Long create(RegistrationRequest rr);
    void updateStatus(long id, String status);
    boolean existsByUsernameOrEmail(String username, String email);
    int countPending();
}