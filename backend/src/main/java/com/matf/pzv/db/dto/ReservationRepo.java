package com.matf.pzv.db.dto;

import com.matf.pzv.db.DB;
import com.matf.pzv.models.Reservation;
import org.springframework.stereotype.Repository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class ReservationRepo implements ReservationRepoInterface {
    private final DB db;

    public ReservationRepo(DB db) { this.db = db; }

    @Override
    public List<Reservation> findByTouristId(long touristId) {
        String sql = "SELECT id, cabin_id, tourist_id, start_date, end_date, adults, children, status, owner_comment, tourist_note, total_price_rsd, card_type, card_last4, created_at FROM reservations WHERE tourist_id=? ORDER BY created_at DESC";
        try {
            return db.query(sql, ps -> ps.setLong(1, touristId), rs -> mapReservation(rs));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public List<Reservation> findCurrentByTouristId(long touristId) {
        String sql = "SELECT id, cabin_id, tourist_id, start_date, end_date, adults, children, status, owner_comment, tourist_note, total_price_rsd, card_type, card_last4, created_at FROM reservations WHERE tourist_id=? AND status IN ('PENDING','ACCEPTED') AND end_date >= CURDATE() ORDER BY start_date ASC";
        try {
            return db.query(sql, ps -> ps.setLong(1, touristId), rs -> mapReservation(rs));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public List<Reservation> findArchiveByTouristId(long touristId) {
        String sql = "SELECT id, cabin_id, tourist_id, start_date, end_date, adults, children, status, owner_comment, tourist_note, total_price_rsd, card_type, card_last4, created_at FROM reservations WHERE tourist_id=? AND (status IN ('REJECTED','CANCELLED') OR (status='ACCEPTED' AND end_date < CURDATE())) ORDER BY created_at DESC";
        try {
            return db.query(sql, ps -> ps.setLong(1, touristId), rs -> mapReservation(rs));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public List<Reservation> findAllByTouristId(long touristId) {
        String sql = "SELECT id, cabin_id, tourist_id, start_date, end_date, adults, children, status, owner_comment, tourist_note, total_price_rsd, card_type, card_last4, created_at FROM reservations WHERE tourist_id=? ORDER BY created_at DESC";
        try {
            return db.query(sql, ps -> ps.setLong(1, touristId), rs -> mapReservation(rs));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public List<Reservation> findPendingByCabinId(long cabinId) {
        String sql = "SELECT id, cabin_id, tourist_id, start_date, end_date, adults, children, status, owner_comment, tourist_note, total_price_rsd, card_type, card_last4, created_at FROM reservations WHERE cabin_id=? AND status='PENDING' ORDER BY created_at ASC";
        try {
            return db.query(sql, ps -> ps.setLong(1, cabinId), rs -> mapReservation(rs));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public List<Reservation> findByCabinId(long cabinId) {
        String sql = "SELECT id, cabin_id, tourist_id, start_date, end_date, adults, children, status, owner_comment, tourist_note, total_price_rsd, card_type, card_last4, created_at FROM reservations WHERE cabin_id=? ORDER BY created_at DESC";
        try {
            return db.query(sql, ps -> ps.setLong(1, cabinId), rs -> mapReservation(rs));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public Long create(Reservation r) {
        String sql = """
            INSERT INTO reservations (cabin_id, tourist_id, start_date, end_date, adults, children, total_price_rsd, card_type, card_last4)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
        try {
            int rows = db.update(sql, ps -> {
                ps.setLong(1, r.getCabinId());
                ps.setLong(2, r.getTouristId());
                ps.setDate(3, r.getStartDate());
                ps.setDate(4, r.getEndDate());
                ps.setInt(5, r.getAdults());
                ps.setInt(6, r.getChildren());
                ps.setInt(7, r.getTotalPriceRsd());
                ps.setString(8, r.getCardType());
                ps.setString(9, r.getCardLast4());
            });
            if (rows == 1) {
                var ids = db.query("SELECT LAST_INSERT_ID()", null, rs -> rs.getLong(1));
                return ids.get(0);
            }
            return null;
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public void updateStatus(long id, String status, String comment) {
        String sql = "UPDATE reservations SET status=?, owner_comment=? WHERE id=?";
        try {
            db.update(sql, ps -> {
                ps.setString(1, status);
                ps.setString(2, comment);
                ps.setLong(3, id);
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public boolean hasConflict(long cabinId, java.sql.Date start, java.sql.Date end) {
        String sql = "SELECT COUNT(*) FROM reservations WHERE cabin_id=? AND status IN ('PENDING', 'ACCEPTED') AND start_date < ? AND end_date > ?";
        try {
            var counts = db.query(sql, ps -> {
                ps.setLong(1, cabinId);
                ps.setDate(2, end);
                ps.setDate(3, start);
            }, rs -> rs.getInt(1));
            return counts.get(0) > 0;
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public boolean hasConflict(long cabinId, java.sql.Date start, java.sql.Date end, long excludeReservationId) {
        String sql = "SELECT COUNT(*) FROM reservations WHERE cabin_id=? AND status IN ('PENDING', 'ACCEPTED') AND start_date < ? AND end_date > ? AND id != ?";
        try {
            var counts = db.query(sql, ps -> {
                ps.setLong(1, cabinId);
                ps.setDate(2, end);
                ps.setDate(3, start);
                ps.setLong(4, excludeReservationId);
            }, rs -> rs.getInt(1));
            return counts.get(0) > 0;
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public java.util.Optional<Reservation> findById(long id) {
        String sql = "SELECT id, cabin_id, tourist_id, start_date, end_date, adults, children, status, owner_comment, tourist_note, total_price_rsd, card_type, card_last4, created_at FROM reservations WHERE id=?";
        try {
            var results = db.query(sql, ps -> ps.setLong(1, id), rs -> mapReservation(rs));
            return results.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(results.get(0));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int countConfirmedInLastHours(int hours) {
        String sql = "SELECT COUNT(*) FROM reservations WHERE status='ACCEPTED' AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)";
        try {
            var counts = db.query(sql, ps -> ps.setInt(1, hours), rs -> rs.getInt(1));
            return counts.get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int countActiveByCabinId(long cabinId) {
        String sql = "SELECT COUNT(*) FROM reservations WHERE cabin_id=? AND status='ACCEPTED' AND end_date >= CURDATE()";
        try {
            var counts = db.query(sql, ps -> ps.setLong(1, cabinId), rs -> rs.getInt(1));
            return counts.get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int countByCabinId(long cabinId) {
        String sql = "SELECT COUNT(*) FROM reservations WHERE cabin_id=?";
        try {
            var counts = db.query(sql, ps -> ps.setLong(1, cabinId), rs -> rs.getInt(1));
            return counts.get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int sumRevenueByCabinIdAndPeriod(long cabinId, java.sql.Date start, java.sql.Date end) {
        String sql = "SELECT COALESCE(SUM(total_price_rsd), 0) FROM reservations WHERE cabin_id=? AND status='ACCEPTED' AND start_date >= ? AND end_date <= ?";
        try {
            var sums = db.query(sql, ps -> {
                ps.setLong(1, cabinId);
                ps.setDate(2, start);
                ps.setDate(3, end);
            }, rs -> rs.getInt(1));
            return sums.get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public Double getAverageRatingByCabinId(long cabinId) {
        String sql = "SELECT AVG(rating) FROM reviews WHERE reservation_id IN (SELECT id FROM reservations WHERE cabin_id=? AND status='ACCEPTED')";
        try {
            var ratings = db.query(sql, ps -> ps.setLong(1, cabinId), rs -> {
                double avg = rs.getDouble(1);
                return rs.wasNull() ? null : avg;
            });
            return ratings.isEmpty() ? null : ratings.get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    public Reservation mapReservation(ResultSet rs) throws SQLException {
        Reservation r = new Reservation();
        r.setId(rs.getLong("id"));
        r.setCabinId(rs.getLong("cabin_id"));
        r.setTouristId(rs.getLong("tourist_id"));
        r.setStartDate(rs.getDate("start_date"));
        r.setEndDate(rs.getDate("end_date"));
        r.setAdults(rs.getInt("adults"));
        r.setChildren(rs.getInt("children"));
        r.setStatus(rs.getString("status"));
        r.setOwnerComment(rs.getString("owner_comment"));
        r.setTouristNote(rs.getString("tourist_note"));
        r.setTotalPriceRsd(rs.getInt("total_price_rsd"));
        r.setCardType(rs.getString("card_type"));
        r.setCardLast4(rs.getString("card_last4"));
        r.setCreatedAt(rs.getTimestamp("created_at"));
        return r;
    }

    @Override
    public int countAll() {
        String sql = "SELECT COUNT(*) FROM reservations";
        try {
            return db.query(sql, null, rs -> rs.getInt(1)).get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int sumMonthlyRevenue() {
        String sql = "SELECT COALESCE(SUM(total_price_rsd), 0) FROM reservations WHERE status='ACCEPTED' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
        try {
            return db.query(sql, null, rs -> rs.getInt(1)).get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int countReservationsByCabinIdAndPeriod(long cabinId, java.sql.Date start, java.sql.Date end, String status) {
        String sql = "SELECT COUNT(*) FROM reservations WHERE cabin_id = ? AND start_date >= ? AND start_date <= ? AND status = ?";
        try {
            return db.query(sql, ps -> {
                ps.setLong(1, cabinId);
                ps.setDate(2, start);
                ps.setDate(3, end);
                ps.setString(4, status);
            }, rs -> rs.getInt(1)).get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public void deleteByCabinId(long cabinId) {
        String sql = "DELETE FROM reservations WHERE cabin_id = ?";
        try {
            db.update(sql, ps -> ps.setLong(1, cabinId));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }
}