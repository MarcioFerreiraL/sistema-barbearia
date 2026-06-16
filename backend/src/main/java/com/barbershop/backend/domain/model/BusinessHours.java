package com.barbershop.backend.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "business_hours")
public class BusinessHours {

    @Id
    private Integer dayOfWeek; // 1 = Segunda, 2 = Terça, ..., 7 = Domingo

    private String dayName;

    private boolean open;

    private String openTime;

    private String closeTime;

    public BusinessHours() {}

    public BusinessHours(Integer dayOfWeek, String dayName, boolean open, String openTime, String closeTime) {
        this.dayOfWeek = dayOfWeek;
        this.dayName = dayName;
        this.open = open;
        this.openTime = openTime;
        this.closeTime = closeTime;
    }

    public Integer getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public String getDayName() {
        return dayName;
    }

    public void setDayName(String dayName) {
        this.dayName = dayName;
    }

    public boolean isOpen() {
        return open;
    }

    public void setOpen(boolean open) {
        this.open = open;
    }

    public String getOpenTime() {
        return openTime;
    }

    public void setOpenTime(String openTime) {
        this.openTime = openTime;
    }

    public String getCloseTime() {
        return closeTime;
    }

    public void setCloseTime(String closeTime) {
        this.closeTime = closeTime;
    }
}
