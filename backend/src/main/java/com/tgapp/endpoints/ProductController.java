package com.tgapp.endpoints;

import com.tgapp.access.AccessControlService;
import com.tgapp.database.models.Product;
import com.tgapp.database.repository.ProductRepository;
import com.tgapp.schemas.ProductDto;
import com.tgapp.schemas.ProductRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;
    private final AccessControlService accessControlService;

    @GetMapping
    public List<ProductDto> getAll(
            @RequestParam(defaultValue = "true") boolean availableOnly,
            @RequestHeader(value = AccessControlService.TELEGRAM_USER_ID_HEADER, required = false)
            Long telegramUserId
    ) {
        if (!availableOnly) {
            accessControlService.requireSellerOrAdmin(telegramUserId);
        }

        List<Product> products = availableOnly
                ? productRepository.findAllByStockGreaterThanOrderByCreatedAtDesc(0)
                : productRepository.findAllByOrderByCreatedAtDesc();

        return products
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

    @PostMapping
    public ResponseEntity<ProductDto> create(
            @RequestHeader(value = AccessControlService.TELEGRAM_USER_ID_HEADER, required = false)
            Long telegramUserId,
            @Valid @RequestBody ProductRequest request
    ) {
        accessControlService.requireSellerOrAdmin(telegramUserId);

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .imageUrl(request.imageUrl())
                .stock(request.stock())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(productRepository.save(product)));
    }

    @PutMapping("/{id}")
    public ProductDto update(
            @PathVariable Long id,
            @RequestHeader(value = AccessControlService.TELEGRAM_USER_ID_HEADER, required = false)
            Long telegramUserId,
            @Valid @RequestBody ProductRequest request
    ) {
        accessControlService.requireSellerOrAdmin(telegramUserId);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());
        product.setStock(request.stock());

        return toDto(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @RequestHeader(value = AccessControlService.TELEGRAM_USER_ID_HEADER, required = false)
            Long telegramUserId
    ) {
        accessControlService.requireAdmin(telegramUserId);

        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
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
