package com.matf.pzv.db.dto;

import com.matf.pzv.models.BannedIdentifier;

public interface BannedIdentifierRepoInterface {
    void create(BannedIdentifier bi);
    boolean isBanned(String type, String value);
}