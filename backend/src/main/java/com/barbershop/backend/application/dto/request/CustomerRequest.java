package com.barbershop.backend.application.dto.request;

public record CustomerRequest(
        String fullName,
        String email,
        String password,
        String phoneNumber
) {}