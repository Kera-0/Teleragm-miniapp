package com.tgapp.schemas;

import com.tgapp.database.models.Order;
import jakarta.validation.constraints.NotNull;

public record OrderStatusRequest(
        @NotNull Order.OrderStatus status
) {}
