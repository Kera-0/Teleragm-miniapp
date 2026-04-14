package com.tgapp.schemas;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductDto(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        Integer stock,
        Instant createdAt
) {}
