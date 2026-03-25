package com.warehouse.controllers;

import com.warehouse.dtos.ProductDTO;
import com.warehouse.dtos.ProductVariantDTO;
import com.warehouse.services.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ProductController {

    private final InventoryService inventoryService;

    // ---- Products ----

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(inventoryService.getAllProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getProduct(id));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO dto) {
        return ResponseEntity.ok(inventoryService.createProduct(dto));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(inventoryService.updateProduct(id, dto));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        inventoryService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    // ---- Variants ----

    @GetMapping("/variants")
    public ResponseEntity<List<ProductVariantDTO>> getAllVariants() {
        return ResponseEntity.ok(inventoryService.getAllVariants());
    }

    @GetMapping("/variants/product/{productId}")
    public ResponseEntity<List<ProductVariantDTO>> getVariantsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getVariantsByProduct(productId));
    }

    @PostMapping("/variants")
    public ResponseEntity<ProductVariantDTO> createVariant(@RequestBody ProductVariantDTO dto) {
        return ResponseEntity.ok(inventoryService.createVariant(dto));
    }

    @PutMapping("/variants/{id}/stock")
    public ResponseEntity<ProductVariantDTO> updateStock(
            @PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(inventoryService.updateStock(id, body.get("stock")));
    }

    @PutMapping("/variants/{id}")
    public ResponseEntity<ProductVariantDTO> updateVariant(
            @PathVariable Long id, @RequestBody ProductVariantDTO dto) {
        return ResponseEntity.ok(inventoryService.updateVariant(id, dto));
    }

    @DeleteMapping("/variants/{id}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Long id) {
        inventoryService.deleteVariant(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/variants/low-stock")
    public ResponseEntity<List<ProductVariantDTO>> getLowStockVariants() {
        return ResponseEntity.ok(inventoryService.getLowStockVariants());
    }

    @GetMapping("/variants/out-of-stock")
    public ResponseEntity<List<ProductVariantDTO>> getOutOfStockVariants() {
        return ResponseEntity.ok(inventoryService.getOutOfStockVariants());
    }
}
