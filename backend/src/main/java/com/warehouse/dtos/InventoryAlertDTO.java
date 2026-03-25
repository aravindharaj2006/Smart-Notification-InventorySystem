package com.warehouse.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryAlertDTO {
    private Long alertId;
    private Long variantId;
    private String productName;
    private String variantName;
    private Integer stock;
    private Integer threshold;
    private String status;
    private String supplierName;
    private String supplierEmail;
    private LocalDateTime createdAt;
}
