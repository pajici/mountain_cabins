package com.matf.pzv.models;

public class Cabin {
    private Long id;
    private Long ownerId;
    private String name;
    private String place;
    private String servicesText;
    private String description;
    private Integer capacity;
    private String phone;
    private Double lat;
    private Double lng;
    private Integer priceSummerRsd;
    private Integer priceWinterRsd;
    private java.sql.Timestamp blockedUntil;
    private java.sql.Timestamp createdAt;
    private java.sql.Timestamp updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPlace() { return place; }
    public void setPlace(String place) { this.place = place; }

    public String getServicesText() { return servicesText; }
    public void setServicesText(String servicesText) { this.servicesText = servicesText; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Integer getPriceSummerRsd() { return priceSummerRsd; }
    public void setPriceSummerRsd(Integer priceSummerRsd) { this.priceSummerRsd = priceSummerRsd; }

    public Integer getPriceWinterRsd() { return priceWinterRsd; }
    public void setPriceWinterRsd(Integer priceWinterRsd) { this.priceWinterRsd = priceWinterRsd; }

    public java.sql.Timestamp getBlockedUntil() { return blockedUntil; }
    public void setBlockedUntil(java.sql.Timestamp blockedUntil) { this.blockedUntil = blockedUntil; }

    public java.sql.Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.sql.Timestamp createdAt) { this.createdAt = createdAt; }

    public java.sql.Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.sql.Timestamp updatedAt) { this.updatedAt = updatedAt; }
}