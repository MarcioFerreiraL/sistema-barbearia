package com.barbershop.backend.domain.repository;

import com.barbershop.backend.domain.model.Appointment;
import com.barbershop.backend.domain.model.Barber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    // Verifica se o barbeiro já está ocupado naquele intervalo de tempo
    // Ignora agendamentos cancelados e concluídos (o barbeiro já está livre nesses casos)
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.barber = :barber AND a.status NOT IN ('CANCELLED', 'COMPLETED') AND " +
            "(a.startTime < :endTime AND a.endTime > :startTime)")
    boolean existsOverlappingAppointment(@Param("barber") Barber barber,
                                         @Param("startTime") LocalDateTime startTime,
                                         @Param("endTime") LocalDateTime endTime);

    Optional<Appointment> getAppointmentByBarberId(UUID barberId);
    Optional<Appointment> getAppointmentByServiceItemId(UUID serviceItemId);

    List<Appointment> findByCustomerId(UUID customerId);
    List<Appointment> findByBarberId(UUID barberId);
}
