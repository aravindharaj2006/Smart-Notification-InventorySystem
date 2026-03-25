package com.warehouse.services;

import com.warehouse.dtos.ProductDTO;
import com.warehouse.dtos.ProductVariantDTO;
import com.warehouse.entities.*;
import com.warehouse.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final SupplierRepository supplierRepository;
    private final NotificationService notificationService;

    // ---- Products ----

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toProductDTO).collect(Collectors.toList());
    }

    public ProductDTO getProduct(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toProductDTO(p);
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = new Product();
        product.setCategory(dto.getCategory() != null && !dto.getCategory().trim().isEmpty() ? dto.getCategory() : "Uncategorized");
        product.setProductName(dto.getProductName());
        if (dto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            product.setSupplier(supplier);
        }
        Product saved = productRepository.save(product);
        return toProductDTO(saved);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setCategory(dto.getCategory() != null && !dto.getCategory().trim().isEmpty() ? dto.getCategory() : "Uncategorized");
        product.setProductName(dto.getProductName());
        if (dto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            product.setSupplier(supplier);
        }
        return toProductDTO(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // ---- Variants ----

    public List<ProductVariantDTO> getAllVariants() {
        return variantRepository.findAll().stream()
                .map(this::toVariantDTO).collect(Collectors.toList());
    }

    public List<ProductVariantDTO> getVariantsByProduct(Long productId) {
        return variantRepository.findByProduct_ProductId(productId).stream()
                .map(this::toVariantDTO).collect(Collectors.toList());
    }

    @Transactional
    public ProductVariantDTO createVariant(ProductVariantDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setVariantName(dto.getVariantName());
        variant.setStock(dto.getStock());
        variant.setThreshold(dto.getThreshold());
        ProductVariant saved = variantRepository.save(variant);

        // Check stock rules immediately
        notificationService.checkLowStock(saved);

        return toVariantDTO(saved);
    }

    @Transactional
    public ProductVariantDTO updateStock(Long variantId, Integer newStock) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        
        if (newStock < variant.getStock()) {
            int diff = variant.getStock() - newStock;
            recordConsumptionAndCheckPattern(variant, diff, newStock);
        }
        
        variant.setStock(newStock);
        ProductVariant saved = variantRepository.save(variant);

        // Check stock rules after update
        notificationService.checkLowStock(saved);

        return toVariantDTO(saved);
    }

    @Transactional
    public ProductVariantDTO updateVariant(Long variantId, ProductVariantDTO dto) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        
        if (dto.getStock() < variant.getStock()) {
            int diff = variant.getStock() - dto.getStock();
            recordConsumptionAndCheckPattern(variant, diff, dto.getStock());
        }

        variant.setVariantName(dto.getVariantName());
        variant.setStock(dto.getStock());
        variant.setThreshold(dto.getThreshold());
        ProductVariant saved = variantRepository.save(variant);
        notificationService.checkLowStock(saved);
        return toVariantDTO(saved);
    }

    public void deleteVariant(Long id) {
        variantRepository.deleteById(id);
    }

    public List<ProductVariantDTO> getLowStockVariants() {
        return variantRepository.findLowStockVariants().stream()
                .map(this::toVariantDTO).collect(Collectors.toList());
    }

    public List<ProductVariantDTO> getOutOfStockVariants() {
        return variantRepository.findOutOfStockVariants().stream()
                .map(this::toVariantDTO).collect(Collectors.toList());
    }

    // ---- Mappers ----

    private void recordConsumptionAndCheckPattern(ProductVariant variant, int diff, int newStock) {
        variant.setDailyUsage((variant.getDailyUsage() != null ? variant.getDailyUsage() : 0) + diff);

        String historyStr = variant.getConsumptionHistory() != null ? variant.getConsumptionHistory() : "";
        java.util.List<Integer> history = new java.util.ArrayList<>();
        if (!historyStr.isEmpty()) {
            for (String s : historyStr.split(",")) {
                try { history.add(Integer.parseInt(s.trim())); } catch (NumberFormatException ignored) {}
            }
        }
        history.add(diff);
        if (history.size() > 3) {
            history.remove(0);
        }
        
        java.util.StringJoiner joiner = new java.util.StringJoiner(",");
        for (Integer h : history) { joiner.add(h.toString()); }
        variant.setConsumptionHistory(joiner.toString());

        if (history.size() >= 3) {
            int txn1 = history.get(history.size() - 3);
            int txn2 = history.get(history.size() - 2);
            int txn3 = history.get(history.size() - 1);
            
            if (txn1 > 0 && txn1 == txn2 && txn2 == txn3) {
                int predictedDemand = txn1;
                if (newStock < predictedDemand) {
                    variant.setThreshold(Math.max(variant.getThreshold(), predictedDemand));
                }
            }
        }
    }

    private ProductDTO toProductDTO(Product p) {
        return ProductDTO.builder()
                .productId(p.getProductId())
                .category(p.getCategory())
                .productName(p.getProductName())
                .supplierId(p.getSupplier() != null ? p.getSupplier().getSupplierId() : null)
                .supplierName(p.getSupplier() != null ? p.getSupplier().getName() : null)
                .variantCount(p.getVariants() != null ? p.getVariants().size() : 0)
                .build();
    }

    private ProductVariantDTO toVariantDTO(ProductVariant v) {
        return ProductVariantDTO.builder()
                .variantId(v.getVariantId())
                .productId(v.getProduct().getProductId())
                .category(v.getProduct().getCategory())
                .productName(v.getProduct().getProductName())
                .supplierName(v.getProduct().getSupplier() != null ? v.getProduct().getSupplier().getName() : null)
                .variantName(v.getVariantName())
                .stock(v.getStock())
                .threshold(v.getThreshold())
                .stockStatus(v.getStockStatus())
                .build();
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateMissingCategories() {
        List<Product> products = productRepository.findAll();
        boolean updated = false;
        for (Product p : products) {
            if (p.getCategory() == null || p.getCategory().trim().isEmpty()) {
                p.setCategory("Uncategorized");
                updated = true;
            }
        }
        if (updated) {
            productRepository.saveAll(products);
        }
    }
}
