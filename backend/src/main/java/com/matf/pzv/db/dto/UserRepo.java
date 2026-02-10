package com.matf.pzv.db.dto;

import com.matf.pzv.db.DB;
import com.matf.pzv.models.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import java.sql.SQLException;
import java.util.Optional;

@Repository
public class UserRepo implements UserRepoInterface {
    private static final Logger logger = LoggerFactory.getLogger(UserRepo.class);
    private final DB db;

    public UserRepo(DB db) { this.db = db; }

    @Override
    public Optional<User> findByUsername(String username) {
        String sql = "SELECT id, username, password_hash, first_name, last_name, gender, address, phone, email, role, active, deleted, blocked_until, profile_image_id, created_at, updated_at FROM users WHERE username=? AND deleted=false";
        try {
            var rows = db.query(sql, ps -> ps.setString(1, username), rs -> {
                User u = new User();
                u.setId(rs.getLong("id"));
                u.setUsername(rs.getString("username"));
                u.setPasswordHash(rs.getString("password_hash"));
                u.setFirstName(rs.getString("first_name"));
                u.setLastName(rs.getString("last_name"));
                u.setGender(rs.getString("gender"));
                u.setAddress(rs.getString("address"));
                u.setPhone(rs.getString("phone"));
                u.setEmail(rs.getString("email"));
                u.setRole(rs.getString("role"));
                u.setActive(rs.getBoolean("active"));
                u.setDeleted(rs.getBoolean("deleted"));
                u.setBlockedUntil(rs.getTimestamp("blocked_until"));
                u.setProfileImageId(rs.getObject("profile_image_id") != null ? rs.getLong("profile_image_id") : null);
                u.setCreatedAt(rs.getTimestamp("created_at"));
                u.setUpdatedAt(rs.getTimestamp("updated_at"));
                return u;
            });
            return rows.stream().findFirst();
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public Optional<User> findById(long id) {
        String sql = "SELECT id, username, password_hash, first_name, last_name, gender, address, phone, email, role, active, deleted, blocked_until, profile_image_id, created_at, updated_at FROM users WHERE id=? AND deleted=false";
        try {
            var rows = db.query(sql, ps -> ps.setLong(1, id), rs -> {
                User u = new User();
                u.setId(rs.getLong("id"));
                u.setUsername(rs.getString("username"));
                u.setPasswordHash(rs.getString("password_hash"));
                u.setFirstName(rs.getString("first_name"));
                u.setLastName(rs.getString("last_name"));
                u.setGender(rs.getString("gender"));
                u.setAddress(rs.getString("address"));
                u.setPhone(rs.getString("phone"));
                u.setEmail(rs.getString("email"));
                u.setRole(rs.getString("role"));
                u.setActive(rs.getBoolean("active"));
                u.setDeleted(rs.getBoolean("deleted"));
                u.setBlockedUntil(rs.getTimestamp("blocked_until"));
                u.setProfileImageId(rs.getObject("profile_image_id") != null ? rs.getLong("profile_image_id") : null);
                u.setCreatedAt(rs.getTimestamp("created_at"));
                u.setUpdatedAt(rs.getTimestamp("updated_at"));
                return u;
            });
            return rows.stream().findFirst();
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public boolean usernameExists(String username) {
        String sql = "SELECT COUNT(*) FROM users WHERE username=? AND deleted=false";
        try { return db.query(sql, ps -> ps.setString(1, username), rs -> rs.getInt(1)).get(0) > 0; }
        catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public boolean emailExists(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email=? AND deleted=false";
        try { return db.query(sql, ps -> ps.setString(1, email), rs -> rs.getInt(1)).get(0) > 0; }
        catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public Long create(User u) {
        String sql = """
            INSERT INTO users (username, password_hash, first_name, last_name, gender, address, phone, email, role, active, profile_image_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?)
        """;
        try {
            int rows = db.update(sql, ps -> {
                ps.setString(1, u.getUsername());
                ps.setString(2, u.getPasswordHash());
                ps.setString(3, u.getFirstName());
                ps.setString(4, u.getLastName());
                ps.setString(5, u.getGender());
                ps.setString(6, u.getAddress());
                ps.setString(7, u.getPhone());
                ps.setString(8, u.getEmail());
                ps.setString(9, u.getRole());
                ps.setObject(10, u.getProfileImageId());
            });
            if (rows == 1) {
                var ids = db.query("SELECT LAST_INSERT_ID()", null, rs -> rs.getLong(1));
                return ids.get(0);
            }
            return null;
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public void update(User u) {
        logger.info("Updating user in database: id={}, firstName={}, lastName={}", 
            u.getId(), u.getFirstName(), u.getLastName());
        
        String sql = """
            UPDATE users SET
                password_hash = ?, first_name = ?, last_name = ?, gender = ?,
                address = ?, phone = ?, email = ?, active = ?, deleted = ?,
                blocked_until = ?, profile_image_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """;
        try {
            int rowsAffected = db.update(sql, ps -> {
                ps.setString(1, u.getPasswordHash());
                ps.setString(2, u.getFirstName());
                ps.setString(3, u.getLastName());
                ps.setString(4, u.getGender());
                ps.setString(5, u.getAddress());
                ps.setString(6, u.getPhone());
                ps.setString(7, u.getEmail());
                ps.setBoolean(8, u.isActive());
                ps.setBoolean(9, u.isDeleted());
                ps.setTimestamp(10, u.getBlockedUntil());
                ps.setObject(11, u.getProfileImageId());
                ps.setLong(12, u.getId());
            });
            logger.info("User update completed: rowsAffected={}", rowsAffected);
            if (rowsAffected == 0) {
                logger.warn("UPDATE affected 0 rows! User ID {} might not exist", u.getId());
            }
        } catch (SQLException e) { 
            logger.error("Failed to update user: id={}", u.getId(), e);
            throw new RuntimeException(e); 
        }
    }

    @Override
    public void updatePassword(long id, String passwordHash) {
        String sql = "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        try {
            db.update(sql, ps -> {
                ps.setString(1, passwordHash);
                ps.setLong(2, id);
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public void deactivate(long id) {
        String sql = "UPDATE users SET active=false WHERE id=?";
        try {
            db.update(sql, ps -> ps.setLong(1, id));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void activate(long id) {
        String sql = "UPDATE users SET active=true WHERE id=?";
        try {
            db.update(sql, ps -> ps.setLong(1, id));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public java.util.List<User> findAll(String q) {
        String sql = "SELECT id, username, first_name, last_name, gender, address, phone, email, role, active, deleted, blocked_until, profile_image_id, created_at, updated_at FROM users WHERE deleted=false";
        if (q != null && !q.trim().isEmpty()) {
            sql += " AND (username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
        }
        sql += " ORDER BY created_at DESC";
        try {
            return db.query(sql, ps -> {
                if (q != null && !q.trim().isEmpty()) {
                    String like = "%" + q + "%";
                    ps.setString(1, like);
                    ps.setString(2, like);
                    ps.setString(3, like);
                    ps.setString(4, like);
                }
            }, rs -> {
                User u = new User();
                u.setId(rs.getLong("id"));
                u.setUsername(rs.getString("username"));
                u.setFirstName(rs.getString("first_name"));
                u.setLastName(rs.getString("last_name"));
                u.setGender(rs.getString("gender"));
                u.setAddress(rs.getString("address"));
                u.setPhone(rs.getString("phone"));
                u.setEmail(rs.getString("email"));
                u.setRole(rs.getString("role"));
                u.setActive(rs.getBoolean("active"));
                u.setDeleted(rs.getBoolean("deleted"));
                u.setBlockedUntil(rs.getTimestamp("blocked_until"));
                u.setProfileImageId(rs.getObject("profile_image_id") != null ? rs.getLong("profile_image_id") : null);
                u.setCreatedAt(rs.getTimestamp("created_at"));
                u.setUpdatedAt(rs.getTimestamp("updated_at"));
                return u;
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int countAll() {
        String sql = "SELECT COUNT(*) FROM users WHERE deleted=false";
        try {
            return db.query(sql, null, rs -> rs.getInt(1)).get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int countByRole(String role) {
        String sql = "SELECT COUNT(*) FROM users WHERE role=? AND deleted=false AND active=true";
        try {
            return db.query(sql, ps -> ps.setString(1, role), rs -> rs.getInt(1)).get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }
}