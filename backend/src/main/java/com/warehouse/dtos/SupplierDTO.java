package com.warehouse.dtos;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupplierDTO {
    private Long supplierId;
    private String name;
    private String email;
    private String phone;
    private int productCount;
}
