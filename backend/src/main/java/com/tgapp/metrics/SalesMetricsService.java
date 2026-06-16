package com.tgapp.metrics;

import com.tgapp.database.models.Order;
import com.tgapp.database.models.OrderItem;
import com.tgapp.database.repository.OrderRepository;
import com.tgapp.database.repository.ProductRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SalesMetricsService {

    private final MeterRegistry meterRegistry;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    private Counter ordersCreatedCounter;
    private Counter revenueCreatedCounter;
    private Counter itemsSoldCreatedCounter;

    @PostConstruct
    void bindMetrics() {
        ordersCreatedCounter = Counter.builder("tgapp_orders_created_total")
                .description("Total orders created since application start")
                .register(meterRegistry);

        revenueCreatedCounter = Counter.builder("tgapp_order_created_revenue_total")
                .baseUnit("currency")
                .description("Total order revenue created since application start")
                .register(meterRegistry);

        itemsSoldCreatedCounter = Counter.builder("tgapp_order_created_items_total")
                .baseUnit("items")
                .description("Total item quantity ordered since application start")
                .register(meterRegistry);

        Gauge.builder("tgapp_orders_total", orderRepository, OrderRepository::count)
                .description("Total orders stored in the database")
                .register(meterRegistry);

        for (Order.OrderStatus status : Order.OrderStatus.values()) {
            Gauge.builder("tgapp_orders_by_status", orderRepository, repo -> repo.countByStatus(status))
                    .description("Orders grouped by status")
                    .tag("status", status.name())
                    .register(meterRegistry);
        }

        Gauge.builder("tgapp_sales_revenue_total", orderRepository, this::totalRevenue)
                .baseUnit("currency")
                .description("Total revenue for non-cancelled orders")
                .register(meterRegistry);

        Gauge.builder("tgapp_items_sold_total", orderRepository, this::itemsSold)
                .baseUnit("items")
                .description("Total item quantity for non-cancelled orders")
                .register(meterRegistry);

        Gauge.builder("tgapp_average_order_value", orderRepository, this::averageOrderValue)
                .baseUnit("currency")
                .description("Average order value for non-cancelled orders")
                .register(meterRegistry);

        Gauge.builder("tgapp_products_total", productRepository, ProductRepository::count)
                .description("Total products stored in the database")
                .register(meterRegistry);

        Gauge.builder("tgapp_products_available_total", productRepository, repo -> repo.countByStockGreaterThan(0))
                .description("Products with stock greater than zero")
                .register(meterRegistry);

        Gauge.builder("tgapp_stock_units_total", productRepository, this::stockUnits)
                .baseUnit("items")
                .description("Total product units currently in stock")
                .register(meterRegistry);
    }

    public void recordOrderCreated(Order order) {
        ordersCreatedCounter.increment();
        revenueCreatedCounter.increment(toDouble(order.getTotalPrice()));
        itemsSoldCreatedCounter.increment(order.getItems().stream()
                .mapToInt(OrderItem::getQuantity)
                .sum());
    }

    public void recordOrderStatusChanged(Order.OrderStatus previousStatus, Order.OrderStatus newStatus) {
        Counter.builder("tgapp_order_status_changes_total")
                .description("Total order status changes since application start")
                .tags(Tags.of("from", previousStatus.name(), "to", newStatus.name()))
                .register(meterRegistry)
                .increment();
    }

    private double totalRevenue(OrderRepository repository) {
        return toDouble(repository.sumTotalPriceWhereStatusNot(Order.OrderStatus.CANCELLED));
    }

    private double itemsSold(OrderRepository repository) {
        return repository.sumItemsWhereOrderStatusNot(Order.OrderStatus.CANCELLED);
    }

    private double averageOrderValue(OrderRepository repository) {
        long activeOrders = repository.count() - repository.countByStatus(Order.OrderStatus.CANCELLED);
        if (activeOrders == 0) {
            return 0;
        }
        return totalRevenue(repository) / activeOrders;
    }

    private double stockUnits(ProductRepository repository) {
        return repository.sumStock();
    }

    private double toDouble(BigDecimal value) {
        return value == null ? 0 : value.doubleValue();
    }
}
