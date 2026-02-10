package com.matf.pzv.db.dto;

import com.matf.pzv.db.DB;
import com.matf.pzv.models.Review;
import org.springframework.stereotype.Repository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class ReviewRepo implements ReviewRepoInterface {
    private final DB db;

    public ReviewRepo(DB db) { this.db = db; }

    @Override
    public List<Review> findByReservationId(long reservationId) {
        String sql = "SELECT id, reservation_id, rating, comment, created_at FROM reviews WHERE reservation_id=? ORDER BY created_at DESC";
        try {
            return db.query(sql, ps -> ps.setLong(1, reservationId), this::mapReview);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public double getAverageRating(long cabinId) {
        String sql = "SELECT AVG(r.rating) FROM reviews r JOIN reservations res ON r.reservation_id = res.id WHERE res.cabin_id = ? AND res.status = 'ACCEPTED'";
        try {
            var results = db.query(sql, ps -> ps.setLong(1, cabinId), rs -> rs.getDouble(1));
            double avgRating = results.isEmpty() || results.get(0) == null ? 0.0 : results.get(0);
            return avgRating;
        } catch (SQLException e) { 
            throw new RuntimeException(e); 
        }
    }

    @Override
    public List<java.math.BigDecimal> getLastThreeRatings(long cabinId) {
        String sql = "SELECT r.rating FROM reviews r " +
                     "JOIN reservations res ON r.reservation_id = res.id " +
                     "WHERE res.cabin_id = ? AND res.status = 'ACCEPTED' " +
                     "ORDER BY r.created_at DESC LIMIT 3";
        try {
            return db.query(sql, ps -> ps.setLong(1, cabinId), rs -> rs.getBigDecimal("rating"));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public Long create(Review r) {
        String sql = "INSERT INTO reviews (reservation_id, rating, comment) VALUES (?, ?, ?)";
        try {
            int rows = db.update(sql, ps -> {
                ps.setLong(1, r.getReservationId());
                ps.setBigDecimal(2, r.getRating());
                ps.setString(3, r.getComment());
            });
            if (rows == 1) {
                var ids = db.query("SELECT LAST_INSERT_ID()", null, rs -> rs.getLong(1));
                return ids.get(0);
            }
            return null;
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public void deleteByCabinId(long cabinId) {
        String sql = "DELETE r FROM reviews r JOIN reservations res ON r.reservation_id = res.id WHERE res.cabin_id = ?";
        try {
            db.update(sql, ps -> ps.setLong(1, cabinId));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    private Review mapReview(ResultSet rs) throws SQLException {
        Review r = new Review();
        r.setId(rs.getLong("id"));
        r.setReservationId(rs.getLong("reservation_id"));
        r.setRating(rs.getBigDecimal("rating"));
        r.setComment(rs.getString("comment"));
        r.setCreatedAt(rs.getTimestamp("created_at"));
        return r;
    }
}