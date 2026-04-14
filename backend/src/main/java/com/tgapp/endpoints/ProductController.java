package com.tgapp.endpoints;

import com.tgapp.database.models.Product;
import com.tgapp.database.repository.ProductRepository;
import com.tgapp.schemas.ProductDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;

    @GetMapping
    public List<ProductDto> getAll() {
        return productRepository.findAllByStockGreaterThan(0)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getImageUrl(),
                p.getStock(),
                p.getCreatedAt()
        );
    }
}
