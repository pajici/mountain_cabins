package com.matf.pzv.db.dto;

import com.matf.pzv.db.DB;
import com.matf.pzv.models.Cabin;
import org.springframework.stereotype.Repository;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class CabinRepo implements CabinRepoInterface {
    private final DB db;

    public CabinRepo(DB db) { this.db = db; }

    @Override
    public Optional<Cabin> findById(long id) {
        String sql = "SELECT id, owner_id, name, place, services_text, description, capacity, phone, lat, lng, price_summer_rsd, price_winter_rsd, blocked_until, created_at, updated_at FROM cabins WHERE id=?";
        try {
            var rows = db.query(sql, ps -> ps.setLong(1, id), rs -> {
                Cabin c = new Cabin();
                c.setId(rs.getLong("id"));
                c.setOwnerId(rs.getLong("owner_id"));
                c.setName(rs.getString("name"));
                c.setPlace(rs.getString("place"));
                c.setServicesText(rs.getString("services_text"));
                c.setDescription(rs.getString("description"));
                c.setCapacity(rs.getInt("capacity"));
                c.setPhone(rs.getString("phone"));
                c.setLat(rs.getDouble("lat"));
                c.setLng(rs.getDouble("lng"));
                c.setPriceSummerRsd(rs.getInt("price_summer_rsd"));
                c.setPriceWinterRsd(rs.getInt("price_winter_rsd"));
                c.setBlockedUntil(rs.getTimestamp("blocked_until"));
                c.setCreatedAt(rs.getTimestamp("created_at"));
                c.setUpdatedAt(rs.getTimestamp("updated_at"));
                return c;
            });
            return rows.stream().findFirst();
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public List<Cabin> findByOwnerId(long ownerId) {
        String sql = "SELECT id, owner_id, name, place, services_text, description, capacity, phone, lat, lng, price_summer_rsd, price_winter_rsd, blocked_until, created_at, updated_at FROM cabins WHERE owner_id=?";
        try {
            return db.query(sql, ps -> ps.setLong(1, ownerId), rs -> {
                Cabin c = new Cabin();
                c.setId(rs.getLong("id"));
                c.setOwnerId(rs.getLong("owner_id"));
                c.setName(rs.getString("name"));
                c.setPlace(rs.getString("place"));
                c.setServicesText(rs.getString("services_text"));
                c.setDescription(rs.getString("description"));
                c.setCapacity(rs.getInt("capacity"));
                c.setPhone(rs.getString("phone"));
                c.setLat(rs.getDouble("lat"));
                c.setLng(rs.getDouble("lng"));
                c.setPriceSummerRsd(rs.getInt("price_summer_rsd"));
                c.setPriceWinterRsd(rs.getInt("price_winter_rsd"));
                c.setBlockedUntil(rs.getTimestamp("blocked_until"));
                c.setCreatedAt(rs.getTimestamp("created_at"));
                c.setUpdatedAt(rs.getTimestamp("updated_at"));
                return c;
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public List<Cabin> findAll(String query, int offset, int limit) {
        String sql = "SELECT id, owner_id, name, place, services_text, description, capacity, phone, lat, lng, price_summer_rsd, price_winter_rsd, blocked_until, created_at, updated_at FROM cabins WHERE blocked_until IS NULL";
        if (query != null && !query.trim().isEmpty()) {
            sql += " AND (name LIKE ? OR place LIKE ?)";
        }
        sql += " ORDER BY id LIMIT ? OFFSET ?";
        try {
            return db.query(sql, ps -> {
                int idx = 1;
                if (query != null && !query.trim().isEmpty()) {
                    ps.setString(idx++, "%" + query + "%");
                    ps.setString(idx++, "%" + query + "%");
                }
                ps.setInt(idx++, limit);
                ps.setInt(idx++, offset);
            }, rs -> {
                Cabin c = new Cabin();
                c.setId(rs.getLong("id"));
                c.setOwnerId(rs.getLong("owner_id"));
                c.setName(rs.getString("name"));
                c.setPlace(rs.getString("place"));
                c.setServicesText(rs.getString("services_text"));
                c.setDescription(rs.getString("description"));
                c.setCapacity(rs.getInt("capacity"));
                c.setPhone(rs.getString("phone"));
                c.setLat(rs.getDouble("lat"));
                c.setLng(rs.getDouble("lng"));
                c.setPriceSummerRsd(rs.getInt("price_summer_rsd"));
                c.setPriceWinterRsd(rs.getInt("price_winter_rsd"));
                c.setBlockedUntil(rs.getTimestamp("blocked_until"));
                c.setCreatedAt(rs.getTimestamp("created_at"));
                c.setUpdatedAt(rs.getTimestamp("updated_at"));
                return c;
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public List<Cabin> findAllForAdmin() {
        String sql = "SELECT id, owner_id, name, place, services_text, description, capacity, phone, lat, lng, price_summer_rsd, price_winter_rsd, blocked_until, created_at, updated_at FROM cabins ORDER BY id";
        try {
            return db.query(sql, ps -> {}, rs -> {
                Cabin c = new Cabin();
                c.setId(rs.getLong("id"));
                c.setOwnerId(rs.getLong("owner_id"));
                c.setName(rs.getString("name"));
                c.setPlace(rs.getString("place"));
                c.setServicesText(rs.getString("services_text"));
                c.setDescription(rs.getString("description"));
                c.setCapacity(rs.getInt("capacity"));
                c.setPhone(rs.getString("phone"));
                c.setLat(rs.getDouble("lat"));
                c.setLng(rs.getDouble("lng"));
                c.setPriceSummerRsd(rs.getInt("price_summer_rsd"));
                c.setPriceWinterRsd(rs.getInt("price_winter_rsd"));
                c.setBlockedUntil(rs.getTimestamp("blocked_until"));
                c.setCreatedAt(rs.getTimestamp("created_at"));
                c.setUpdatedAt(rs.getTimestamp("updated_at"));
                return c;
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public Long create(Cabin c) {
        String sql = """
            INSERT INTO cabins (owner_id, name, place, services_text, description, capacity, phone, lat, lng, price_summer_rsd, price_winter_rsd)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
        try {
            return db.insertAndGetId(sql, ps -> {
                ps.setLong(1, c.getOwnerId());
                ps.setString(2, c.getName());
                ps.setString(3, c.getPlace());
                ps.setString(4, c.getServicesText());
                ps.setString(5, c.getDescription());
                ps.setInt(6, c.getCapacity() != null ? c.getCapacity() : 4);
                ps.setString(7, c.getPhone());
                ps.setDouble(8, c.getLat() != null ? c.getLat() : 0.0);
                ps.setDouble(9, c.getLng() != null ? c.getLng() : 0.0);
                ps.setInt(10, c.getPriceSummerRsd() != null ? c.getPriceSummerRsd() : 0);
                ps.setInt(11, c.getPriceWinterRsd() != null ? c.getPriceWinterRsd() : 0);
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public void update(Cabin c) {
        String sql = """
            UPDATE cabins SET name=?, place=?, services_text=?, description=?, capacity=?, phone=?, lat=?, lng=?, price_summer_rsd=?, price_winter_rsd=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        """;
        try {
            db.update(sql, ps -> {
                ps.setString(1, c.getName());
                ps.setString(2, c.getPlace());
                ps.setString(3, c.getServicesText());
                ps.setString(4, c.getDescription());
                ps.setInt(5, c.getCapacity() != null ? c.getCapacity() : 4);
                ps.setString(6, c.getPhone());
                ps.setDouble(7, c.getLat() != null ? c.getLat() : 0.0);
                ps.setDouble(8, c.getLng() != null ? c.getLng() : 0.0);
                ps.setInt(9, c.getPriceSummerRsd() != null ? c.getPriceSummerRsd() : 0);
                ps.setInt(10, c.getPriceWinterRsd() != null ? c.getPriceWinterRsd() : 0);
                ps.setLong(11, c.getId());
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public void softDelete(long id) {
        String sql = "DELETE FROM cabins WHERE id=?";
        try {
            db.update(sql, ps -> ps.setLong(1, id));
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete cabin", e);
        }
    }

    @Override
    public void block(long id, java.sql.Timestamp until) {
        String sql = "UPDATE cabins SET blocked_until=? WHERE id=?";
        try {
            db.update(sql, ps -> {
                ps.setTimestamp(1, until);
                ps.setLong(2, id);
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public List<Cabin> findLowRating() {
        String sql = """
            SELECT DISTINCT c.id, c.owner_id, c.name, c.place, c.services_text, c.phone, c.lat, c.lng, c.price_summer_rsd, c.price_winter_rsd, c.blocked_until, c.created_at, c.updated_at
            FROM cabins c
            JOIN cabin_images ci ON c.id = ci.cabin_id
            JOIN reservations r ON c.id = r.cabin_id
            JOIN reviews rv ON r.id = rv.reservation_id
            WHERE c.blocked_until IS NULL
            GROUP BY c.id
            HAVING AVG(rv.rating) < 2 AND COUNT(rv.id) >= 3
            ORDER BY AVG(rv.rating) ASC
        """;
        try {
            return db.query(sql, null, rs -> {
                Cabin c = new Cabin();
                c.setId(rs.getLong("id"));
                c.setOwnerId(rs.getLong("owner_id"));
                c.setName(rs.getString("name"));
                c.setPlace(rs.getString("place"));
                c.setServicesText(rs.getString("services_text"));
                c.setPhone(rs.getString("phone"));
                c.setLat(rs.getDouble("lat"));
                c.setLng(rs.getDouble("lng"));
                c.setPriceSummerRsd(rs.getInt("price_summer_rsd"));
                c.setPriceWinterRsd(rs.getInt("price_winter_rsd"));
                c.setBlockedUntil(rs.getTimestamp("blocked_until"));
                c.setCreatedAt(rs.getTimestamp("created_at"));
                c.setUpdatedAt(rs.getTimestamp("updated_at"));
                return c;
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int countAll() {
        String sql = "SELECT COUNT(*) FROM cabins";
        try {
            return db.query(sql, null, rs -> rs.getInt(1)).get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public int countActive() {
        String sql = "SELECT COUNT(*) FROM cabins WHERE blocked_until IS NULL OR blocked_until < NOW()";
        try {
            return db.query(sql, null, rs -> rs.getInt(1)).get(0);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }
}