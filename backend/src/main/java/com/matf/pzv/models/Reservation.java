package com.matf.pzv.models;

public class Reservation {
    private Long id;
    private Long cabinId;
    private Long touristId;
    private java.sql.Date startDate;
    private java.sql.Date endDate;
    private Integer adults;
    private Integer children;
    private String status;
    private String ownerComment;
    private String touristNote;
    private Integer totalPriceRsd;
    private String cardType;
    private String cardLast4;
    private java.sql.Timestamp createdAt;
    private String cabinName;
    private String cabinLocation;
    private Boolean isReviewed;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCabinId() { return cabinId; }
    public void setCabinId(Long cabinId) { this.cabinId = cabinId; }

    public Long getTouristId() { return touristId; }
    public void setTouristId(Long touristId) { this.touristId = touristId; }

    public java.sql.Date getStartDate() { return startDate; }
    public void setStartDate(java.sql.Date startDate) { this.startDate = startDate; }

    public java.sql.Date getEndDate() { return endDate; }
    public void setEndDate(java.sql.Date endDate) { this.endDate = endDate; }

    public Integer getAdults() { return adults; }
    public void setAdults(Integer adults) { this.adults = adults; }

    public Integer getChildren() { return children; }
    public void setChildren(Integer children) { this.children = children; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOwnerComment() { return ownerComment; }
    public void setOwnerComment(String ownerComment) { this.ownerComment = ownerComment; }

    public String getTouristNote() { return touristNote; }
    public void setTouristNote(String touristNote) { this.touristNote = touristNote; }

    public Integer getTotalPriceRsd() { return totalPriceRsd; }
    public void setTotalPriceRsd(Integer totalPriceRsd) { this.totalPriceRsd = totalPriceRsd; }

    public String getCardType() { return cardType; }
    public void setCardType(String cardType) { this.cardType = cardType; }

    public String getCardLast4() { return cardLast4; }
    public void setCardLast4(String cardLast4) { this.cardLast4 = cardLast4; }

    public java.sql.Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.sql.Timestamp createdAt) { this.createdAt = createdAt; }

    public String getCabinName() { return cabinName; }
    public void setCabinName(String cabinName) { this.cabinName = cabinName; }

    public String getCabinLocation() { return cabinLocation; }
    public void setCabinLocation(String cabinLocation) { this.cabinLocation = cabinLocation; }

    public Boolean getIsReviewed() { return isReviewed; }
    public void setIsReviewed(Boolean isReviewed) { this.isReviewed = isReviewed; }
}