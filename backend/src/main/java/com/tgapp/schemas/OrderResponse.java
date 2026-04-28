package com.tgapp.schemas;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        Long telegramUserId,
        String status,
        BigDecimal totalPrice,
        Instant createdAt,
        List<OrderItemResponse> items
) {
    public record OrderItemResponse(
            Long id,
            Long productId,
            String productName,
            String productImageUrl,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal totalPrice
    ) {}
}
