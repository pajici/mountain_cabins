package com.matf.pzv.db.dto;

import com.matf.pzv.models.Reservation;
import java.util.List;

public interface ReservationRepoInterface {
    List<Reservation> findByTouristId(long touristId);
    List<Reservation> findCurrentByTouristId(long touristId);
    List<Reservation> findArchiveByTouristId(long touristId);
    List<Reservation> findAllByTouristId(long touristId);
    List<Reservation> findPendingByCabinId(long cabinId);
    List<Reservation> findByCabinId(long cabinId);
    Long create(Reservation r);
    void updateStatus(long id, String status, String comment);
    boolean hasConflict(long cabinId, java.sql.Date start, java.sql.Date end);
    boolean hasConflict(long cabinId, java.sql.Date start, java.sql.Date end, long excludeReservationId);
    java.util.Optional<Reservation> findById(long id);
    int countConfirmedInLastHours(int hours);
    int countActiveByCabinId(long cabinId);
    int countByCabinId(long cabinId);
    int sumRevenueByCabinIdAndPeriod(long cabinId, java.sql.Date start, java.sql.Date end);
    Double getAverageRatingByCabinId(long cabinId);
    int countAll();
    int sumMonthlyRevenue();
    int countReservationsByCabinIdAndPeriod(long cabinId, java.sql.Date start, java.sql.Date end, String status);
    void deleteByCabinId(long cabinId);
}