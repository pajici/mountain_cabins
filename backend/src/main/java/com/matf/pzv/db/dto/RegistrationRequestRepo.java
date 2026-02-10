package com.matf.pzv.db.dto;

import com.matf.pzv.db.DB;
import com.matf.pzv.models.RegistrationRequest;
import org.springframework.stereotype.Repository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class RegistrationRequestRepo implements RegistrationRequestRepoInterface {
    private final DB db;

    public RegistrationRequestRepo(DB db) { this.db = db; }

    @Override
    public List<RegistrationRequest> findAllPending() {
        String sql = "SELECT id, username, email, role, first_name, last_name, gender, address, phone, password_hash, card_type, card_last4, profile_image, status, created_at FROM registration_request WHERE status='PENDING' ORDER BY created_at ASC";
        try {
            return db.query(sql, null, this::mapRegistrationRequest);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public Optional<RegistrationRequest> findById(long id) {
        String sql = "SELECT id, username, email, role, first_name, last_name, gender, address, phone, password_hash, card_type, card_last4, profile_image, status, created_at FROM registration_request WHERE id=?";
        try {
            var rows = db.query(sql, ps -> ps.setLong(1, id), this::mapRegistrationRequest);
            return rows.stream().findFirst();
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public Long create(RegistrationRequest rr) {
        String sql = """
            INSERT INTO registration_request (username, email, role, first_name, last_name, gender, address, phone, password_hash, card_type, card_last4, profile_image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
        try {
            int rows = db.update(sql, ps -> {
                ps.setString(1, rr.getUsername());
                ps.setString(2, rr.getEmail());
                ps.setString(3, rr.getRole());
                ps.setString(4, rr.getFirstName());
                ps.setString(5, rr.getLastName());
                ps.setString(6, rr.getGender());
                ps.setString(7, rr.getAddress());
                ps.setString(8, rr.getPhone());
                ps.setString(9, rr.getPassword());
                ps.setString(10, rr.getCardType());
                ps.setString(11, rr.getCardLast4());
                ps.setBytes(12, rr.getProfileImage());
            });
            if (rows == 1) {
                var ids = db.query("SELECT LAST_INSERT_ID()", null, rs -> rs.getLong(1));
                return ids.get(0);
            }
            return null;
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public void updateStatus(long id, String status) {
        String sql = "UPDATE registration_request SET status=? WHERE id=?";
        try {
            db.update(sql, ps -> {
                ps.setString(1, status);
                ps.setLong(2, id);
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public boolean existsByUsernameOrEmail(String username, String email) {
        String sql = "SELECT COUNT(*) FROM registration_request WHERE (username=? OR email=?) AND status != 'REJECTED'";
        try {
            var counts = db.query(sql, ps -> {
                ps.setString(1, username);
                ps.setString(2, email);
            }, rs -> rs.getInt(1));
            return counts.get(0) > 0;
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int countPending() {
        String sql = "SELECT COUNT(*) FROM registration_request WHERE status='PENDING'";
        try {
            return db.query(sql, null, rs -> rs.getInt(1)).get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    private RegistrationRequest mapRegistrationRequest(ResultSet rs) throws SQLException {
        RegistrationRequest rr = new RegistrationRequest();
        rr.setId(rs.getLong("id"));
        rr.setUsername(rs.getString("username"));
        rr.setEmail(rs.getString("email"));
        rr.setRole(rs.getString("role"));
        rr.setFirstName(rs.getString("first_name"));
        rr.setLastName(rs.getString("last_name"));
        rr.setGender(rs.getString("gender"));
        rr.setAddress(rs.getString("address"));
        rr.setPhone(rs.getString("phone"));
        rr.setPassword(rs.getString("password_hash"));
        rr.setCardType(rs.getString("card_type"));
        rr.setCardLast4(rs.getString("card_last4"));
        rr.setProfileImage(rs.getBytes("profile_image"));
        rr.setStatus(rs.getString("status"));
        rr.setCreatedAt(rs.getTimestamp("created_at"));
        return rr;
    }
}