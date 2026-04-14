package com.tgapp.endpoints;

import com.tgapp.database.models.Order;
import com.tgapp.database.models.OrderItem;
import com.tgapp.database.models.Product;
import com.tgapp.database.repository.OrderRepository;
import com.tgapp.database.repository.ProductRepository;
import com.tgapp.schemas.OrderRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @GetMapping("/user/{telegramUserId}")
    public List<Order> getUserOrders(@PathVariable Long telegramUserId) {
        return orderRepository.findAllByTelegramUserId(telegramUserId);
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderRequest request) {
        Order order = Order.builder()
                .telegramUserId(request.telegramUserId())
                .status(Order.OrderStatus.PENDING)
                .totalPrice(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (OrderRequest.OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemReq.productId()));

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.quantity())
                    .unitPrice(product.getPrice())
                    .build();

            order.getItems().add(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity())));
        }

        order.setTotalPrice(total);
        return ResponseEntity.ok(orderRepository.save(order));
    }
}
