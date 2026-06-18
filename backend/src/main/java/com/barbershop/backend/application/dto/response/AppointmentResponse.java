package com.barbershop.backend.application.dto.response;

import com.barbershop.backend.domain.model.enums.AppointmentStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID customerId,
        String customerName,
        UUID barberId,
        String barberName,
        String serviceName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        AppointmentStatus status
) {}