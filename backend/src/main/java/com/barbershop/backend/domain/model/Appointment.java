package com.barbershop.backend.domain.model;

import com.barbershop.backend.domain.model.enums.AppointmentStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


import javax.swing.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name="tb_appointment")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    Customer customer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "barber_id", nullable = false)
    Barber barber;

    @ManyToOne(optional = false)
    @JoinColumn(name = "service_item_id", nullable = false)
    ServiceItem serviceItem;

    @Column(nullable = false)
    LocalDateTime startTime;

    @Column(nullable = false)
    LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    AppointmentStatus status;

    @Version // Protege contra dois clientes ao tentarem marcar a mesma hora
    Long version;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updateAt;

    public Appointment() {}

    public Appointment(Customer customer, Barber barber, ServiceItem serviceItem, LocalDateTime startTime) {
        this.customer = customer;
        this.barber = barber;
        this.serviceItem = serviceItem;
        this.startTime = startTime;
        this.endTime = startTime.plusMinutes(serviceItem.getDurationInMinutes());
        this.status = AppointmentStatus.SCHEDULED;
    }


    public UUID getId() { return id; }
    public Customer getCustomer() { return customer; }
    public Barber getBarber() { return barber; }
    public ServiceItem getServiceItem() { return serviceItem; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }
}
