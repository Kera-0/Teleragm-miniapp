package com.tgapp.database.repository;

import com.tgapp.database.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByTelegramUserId(Long telegramUserId);

    List<Order> findAllByTelegramUserIdOrderByCreatedAtDesc(Long telegramUserId);

    List<Order> findAllByOrderByCreatedAtDesc();
}
