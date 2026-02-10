package com.matf.pzv.db.dto;

import com.matf.pzv.models.Cabin;
import java.util.List;
import java.util.Optional;

public interface CabinRepoInterface {
    Optional<Cabin> findById(long id);
    List<Cabin> findByOwnerId(long ownerId);
    List<Cabin> findAll(String query, int offset, int limit);
    List<Cabin> findAllForAdmin();
    Long create(Cabin c);
    void update(Cabin c);
    void softDelete(long id);
    void block(long id, java.sql.Timestamp until);
    List<Cabin> findLowRating();
    int countAll();
    int countActive();
}