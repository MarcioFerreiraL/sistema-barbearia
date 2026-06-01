package com.barbershop.backend.application.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentRequest(
        UUID customerId,
        UUID barberId,
        Long serviceItemId,
        LocalDateTime startTime
) {}