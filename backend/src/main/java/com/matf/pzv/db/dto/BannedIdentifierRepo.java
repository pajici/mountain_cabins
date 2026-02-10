package com.matf.pzv.db.dto;

import com.matf.pzv.db.DB;
import com.matf.pzv.models.BannedIdentifier;
import org.springframework.stereotype.Repository;
import java.sql.SQLException;

@Repository
public class BannedIdentifierRepo implements BannedIdentifierRepoInterface {
    private final DB db;

    public BannedIdentifierRepo(DB db) { this.db = db; }

    @Override
    public void create(BannedIdentifier bi) {
        String sql = "INSERT INTO banned_identifiers (type, value) VALUES (?, ?)";
        try {
            db.update(sql, ps -> {
                ps.setString(1, bi.getType());
                ps.setString(2, bi.getValue());
            });
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    @Override
    public boolean isBanned(String type, String value) {
        String sql = "SELECT COUNT(*) FROM banned_identifiers WHERE type=? AND value=?";
        try {
            var counts = db.query(sql, ps -> {
                ps.setString(1, type);
                ps.setString(2, value);
            }, rs -> rs.getInt(1));
            return counts.get(0) > 0;
        } catch (SQLException e) { throw new RuntimeException(e); }
    }
}