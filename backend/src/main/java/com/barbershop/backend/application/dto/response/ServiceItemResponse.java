package com.barbershop.backend.application.dto.response;

import java.math.BigDecimal;

public record ServiceItemResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer durationInMinutes,
        boolean active
) {}