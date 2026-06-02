package com.barbershop.backend.application.dto.response;

import java.util.UUID;

public record BarberResponse(
        UUID id,
        String fullName,
        String email,
        String phoneNumber,
        boolean active
) {}