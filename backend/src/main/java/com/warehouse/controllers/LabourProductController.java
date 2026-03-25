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
@RequestMapping("/api/labour/products")
@RequiredArgsConstructor
public class LabourProductController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(inventoryService.getAllProducts());
    }

    @GetMapping("/variants")
    public ResponseEntity<List<ProductVariantDTO>> getAllVariants() {
        return ResponseEntity.ok(inventoryService.getAllVariants());
    }

    @PutMapping("/variants/{id}/stock")
    public ResponseEntity<ProductVariantDTO> updateStock(
            @PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(inventoryService.updateStock(id, body.get("stock")));
    }
}
