package com.warehouse.dtos;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductVariantDTO {
    private Long variantId;
    private Long productId;
    private String category;
    private String productName;
    private String variantName;
    private String supplierName;
    private Integer stock;
    private Integer threshold;
    private String stockStatus;
}
