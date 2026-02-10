package com.matf.pzv.db.dto;

import com.matf.pzv.models.Review;
import java.math.BigDecimal;
import java.util.List;

public interface ReviewRepoInterface {
    List<Review> findByReservationId(long reservationId);
    Long create(Review r);
    double getAverageRating(long cabinId);
    List<BigDecimal> getLastThreeRatings(long cabinId);
    void deleteByCabinId(long cabinId);
}