package com.matf.pzv.models;

public class CabinImage {
    private Long id;
    private Long cabinId;
    private String variant;
    private String mimeType;
    private int width;
    private int height;
    private byte[] data;
    private java.sql.Timestamp createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCabinId() { return cabinId; }
    public void setCabinId(Long cabinId) { this.cabinId = cabinId; }

    public String getVariant() { return variant; }
    public void setVariant(String variant) { this.variant = variant; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public int getWidth() { return width; }
    public void setWidth(int width) { this.width = width; }

    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }

    public byte[] getData() { return data; }
    public void setData(byte[] data) { this.data = data; }

    public java.sql.Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.sql.Timestamp createdAt) { this.createdAt = createdAt; }
}