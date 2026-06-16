package com.tgapp.database.repository;

import com.tgapp.database.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByStockGreaterThan(int stock);

    List<Product> findAllByOrderByCreatedAtDesc();

    List<Product> findAllByStockGreaterThanOrderByCreatedAtDesc(int stock);

    long countByStockGreaterThan(int stock);

    @Query("select coalesce(sum(p.stock), 0) from Product p")
    Long sumStock();
}
