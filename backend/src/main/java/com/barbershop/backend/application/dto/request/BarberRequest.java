package com.barbershop.backend.application.dto.request;

public record BarberRequest(
        String fullName,
        String email,
        String password,
        String phoneNumber
) {}