package com.barbershop.backend.application.dto.request;

import java.math.BigDecimal;

public record ServiceItemRequest(
        String name,
        String description,
        BigDecimal price,
        Integer durationInMinutes
) {}