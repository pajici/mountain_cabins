package com.matf.pzv.db.dto;

import com.matf.pzv.models.CabinImage;
import java.util.List;
import java.util.Optional;

public interface CabinImageRepoInterface {
    List<CabinImage> findByCabinId(long cabinId);
    Optional<CabinImage> findById(long id);
    Long create(CabinImage ci);
    void deleteByCabinId(long cabinId);
}