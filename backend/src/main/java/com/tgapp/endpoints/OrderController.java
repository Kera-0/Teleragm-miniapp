package com.tgapp.endpoints;

import com.tgapp.database.models.Order;
import com.tgapp.database.models.OrderItem;
import com.tgapp.database.models.Product;
import com.tgapp.database.repository.OrderRepository;
import com.tgapp.database.repository.ProductRepository;
import com.tgapp.schemas.OrderRequest;
import com.tgapp.schemas.OrderResponse;
import com.tgapp.schemas.OrderStatusRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @GetMapping
    @Transactional
    public List<OrderResponse> getAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional
    public OrderResponse getById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @GetMapping("/user/{telegramUserId}")
    @Transactional
    public List<OrderResponse> getUserOrders(@PathVariable Long telegramUserId) {
        return orderRepository.findAllByTelegramUserIdOrderByCreatedAtDesc(telegramUserId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        Map<Long, Integer> quantitiesByProduct = mergeQuantities(request);

        Order order = Order.builder()
                .telegramUserId(request.telegramUserId())
                .status(Order.OrderStatus.PENDING)
                .totalPrice(BigDecimal.ZERO)
                .build();

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (Map.Entry<Long, Integer> entry : quantitiesByProduct.entrySet()) {
            Product product = productRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

            int quantity = entry.getValue();
            if (product.getStock() < quantity) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Not enough stock for product " + product.getId()
                );
            }

            product.setStock(product.getStock() - quantity);
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            totalPrice = totalPrice.add(itemTotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .build();
            order.getItems().add(item);
        }

        order.setTotalPrice(totalPrice);
        Order savedOrder = orderRepository.save(order);

        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(savedOrder));
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public OrderResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusRequest request
    ) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        order.setStatus(request.status());
        return toDto(orderRepository.save(order));
    }

    private Map<Long, Integer> mergeQuantities(OrderRequest request) {
        Map<Long, Integer> quantitiesByProduct = new LinkedHashMap<>();
        for (OrderRequest.OrderItemRequest item : request.items()) {
            quantitiesByProduct.merge(item.productId(), item.quantity(), Integer::sum);
        }
        return quantitiesByProduct;
    }

    private OrderResponse toDto(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getTelegramUserId(),
                order.getStatus().name(),
                order.getTotalPrice(),
                order.getCreatedAt(),
                order.getItems().stream()
                        .map(this::toDto)
                        .toList()
        );
    }

    private OrderResponse.OrderItemResponse toDto(OrderItem item) {
        BigDecimal totalPrice = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        Product product = item.getProduct();

        return new OrderResponse.OrderItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                item.getQuantity(),
                item.getUnitPrice(),
                totalPrice
        );
    }
}
