package com.barbershop.backend.application.dto.response;

import java.util.UUID;

public record CustomerResponse(
        UUID id,
        String fullName,
        String email,
        String phoneNumber,
        boolean active
) {}