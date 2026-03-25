package com.warehouse.dtos;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductDTO {
    private Long productId;
    private String category;
    private String productName;
    private Long supplierId;
    private String supplierName;
    private int variantCount;
}
