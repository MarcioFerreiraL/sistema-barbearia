package com.barbershop.backend.application.dto.request;

import java.util.UUID;

public record AdminRequest(
        String fullName,
        String email,
        String password,
        String phoneNumber
) {}
