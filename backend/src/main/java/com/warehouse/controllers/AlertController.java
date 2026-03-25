package com.warehouse.controllers;

import com.warehouse.dtos.InventoryAlertDTO;
import com.warehouse.entities.InventoryAlert;
import com.warehouse.entities.Supplier;
import com.warehouse.repositories.InventoryAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final InventoryAlertRepository inventoryAlertRepository;

    @GetMapping
    public ResponseEntity<List<InventoryAlertDTO>> getActiveAlerts() {
        List<InventoryAlert> activeAlerts = inventoryAlertRepository.findAllByResolvedFalseOrderByCreatedAtDesc();

        List<InventoryAlertDTO> dtos = activeAlerts.stream().map(a -> {
            Supplier supplier = a.getProductVariant().getProduct().getSupplier();
            return InventoryAlertDTO.builder()
                    .alertId(a.getAlertId())
                    .variantId(a.getProductVariant().getVariantId())
                    .productName(a.getProductVariant().getProduct().getProductName())
                    .variantName(a.getProductVariant().getVariantName())
                    .stock(a.getProductVariant().getStock())
                    .threshold(a.getProductVariant().getThreshold())
                    .status(a.getStatus())
                    .supplierName(supplier != null ? supplier.getName() : "Unassigned")
                    .supplierEmail(supplier != null ? supplier.getEmail() : "N/A")
                    .createdAt(a.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
