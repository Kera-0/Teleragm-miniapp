package com.tgapp.database.repository;

import com.tgapp.database.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByTelegramUserId(Long telegramUserId);

    List<Order> findAllByTelegramUserIdOrderByCreatedAtDesc(Long telegramUserId);

    List<Order> findAllByOrderByCreatedAtDesc();

    long countByStatus(Order.OrderStatus status);

    @Query("select coalesce(sum(o.totalPrice), 0) from Order o where o.status <> :status")
    BigDecimal sumTotalPriceWhereStatusNot(@Param("status") Order.OrderStatus status);

    @Query("select coalesce(sum(i.quantity), 0) from OrderItem i where i.order.status <> :status")
    Long sumItemsWhereOrderStatusNot(@Param("status") Order.OrderStatus status);
}
