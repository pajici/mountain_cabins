package com.matf.pzv.db.dto;

import com.matf.pzv.db.DB;
import com.matf.pzv.models.CabinImage;
import org.springframework.stereotype.Repository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class CabinImageRepo implements CabinImageRepoInterface {
    private final DB db;

    public CabinImageRepo(DB db) { this.db = db; }

    @Override
    public List<CabinImage> findByCabinId(long cabinId) {
        String sql = "SELECT id, cabin_id, variant, mime_type, width, height, data, created_at FROM cabin_images WHERE cabin_id=? ORDER BY id ASC";
        try {
            return db.query(sql, ps -> ps.setLong(1, cabinId), this::mapCabinImage);
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public Optional<CabinImage> findById(long id) {
        String sql = "SELECT id, cabin_id, variant, mime_type, width, height, data, created_at FROM cabin_images WHERE id=?";
        try {
            List<CabinImage> results = db.query(sql, ps -> ps.setLong(1, id), this::mapCabinImage);
            return results.stream().findFirst();
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public Long create(CabinImage ci) {
        String sql = "INSERT INTO cabin_images (cabin_id, variant, mime_type, width, height, data) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            return db.insertAndGetId(sql, ps -> {
                if (ci.getCabinId() != null) {
                    ps.setLong(1, ci.getCabinId());
                } else {
                    ps.setNull(1, java.sql.Types.BIGINT);
                }
                ps.setString(2, ci.getVariant());
                ps.setString(3, ci.getMimeType());
                ps.setInt(4, ci.getWidth());
                ps.setInt(5, ci.getHeight());
                ps.setBytes(6, ci.getData());
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public void deleteByCabinId(long cabinId) {
        String sql = "DELETE FROM cabin_images WHERE cabin_id=?";
        try {
            db.update(sql, ps -> ps.setLong(1, cabinId));
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    private CabinImage mapCabinImage(ResultSet rs) throws SQLException {
        CabinImage ci = new CabinImage();
        ci.setId(rs.getLong("id"));
        ci.setCabinId(rs.getLong("cabin_id"));
        ci.setVariant(rs.getString("variant"));
        ci.setMimeType(rs.getString("mime_type"));
        ci.setWidth(rs.getInt("width"));
        ci.setHeight(rs.getInt("height"));
        ci.setData(rs.getBytes("data"));
        ci.setCreatedAt(rs.getTimestamp("created_at"));
        return ci;
    }
}