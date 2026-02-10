package com.matf.pzv.db;

import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class DB {

    private final DataSource dataSource;

    public DB(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public <T> List<T> query(String sql, SqlConsumer<PreparedStatement> binder, SqlFunction<ResultSet, T> mapper) throws SQLException {
        try (Connection c = dataSource.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            if (binder != null) binder.accept(ps);
            try (ResultSet rs = ps.executeQuery()) {
                List<T> out = new ArrayList<>();
                while (rs.next()) out.add(mapper.apply(rs));
                return out;
            }
        }
    }

    public int update(String sql, SqlConsumer<PreparedStatement> binder) throws SQLException {
        try (Connection c = dataSource.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            if (binder != null) binder.accept(ps);
            return ps.executeUpdate();
        }
    }

    public Long insertAndGetId(String sql, SqlConsumer<PreparedStatement> binder) throws SQLException {
        try (Connection c = dataSource.getConnection(); 
             PreparedStatement ps = c.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            if (binder != null) binder.accept(ps);
            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getLong(1);
                    }
                }
            }
            return null;
        }
    }

    @FunctionalInterface
    public interface SqlConsumer<T> {
        void accept(T t) throws SQLException;
    }

    @FunctionalInterface
    public interface SqlFunction<T, R> {
        R apply(T t) throws SQLException;
    }
}