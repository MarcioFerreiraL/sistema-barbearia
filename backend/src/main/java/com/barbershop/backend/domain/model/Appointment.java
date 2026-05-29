package com.barbershop.backend.domain.model;

import com.barbershop.backend.domain.model.enums.AppointmentStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Version;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.validator.constraints.UUID;

import java.time.LocalDateTime;

public class Appointment {

    UUID id;
    Customer customer;
    Barber barber;
    ServiceItem serviceItem;
    LocalDateTime startTime;
    LocalDateTime endTime;
    @Enumerated(EnumType.STRING)
    AppointmentStatus status;
    @Version
    Long version;
    @CreationTimestamp
    LocalDateTime createdAt;
    @UpdateTimestamp
    LocalDateTime updateAt;

    public Appointment(Customer customer, Barber barber, ServiceItem serviceItem, LocalDateTime startTime, AppointmentStatus status, Long version) {
        this.customer = customer;
        this.barber = barber;
        this.serviceItem = serviceItem;

        this.startTime = startTime;
        this.status = status;
        this.version = version;
    }

    public UUID getId() {
        return id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Barber getBarber() {
        return barber;
    }

    public void setBarber(Barber barber) {
        this.barber = barber;
    }

    public ServiceItem getServiceItem() {
        return serviceItem;
    }

    public void setServiceItem(ServiceItem serviceItem) {
        this.serviceItem = serviceItem;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public LocalDateTime setEndTime(LocalDateTime startTime) {


        LocalDateTime endTime = startTime.minusMinutes() + serviceItem.getDurationInMinutes();
        return endTime;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
