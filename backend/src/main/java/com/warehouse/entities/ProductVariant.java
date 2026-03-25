package com.warehouse.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variant_id")
    private Long variantId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "variant_name", nullable = false)
    private String variantName;

    @Column(nullable = false)
    private Integer stock;

    @Column(nullable = false)
    private Integer threshold;

    @Column(name = "last_alert_sent_at")
    private LocalDateTime lastAlertSentAt;

    @Column(name = "last_email_sent_at")
    private LocalDateTime lastEmailSentAt;

    @Column(name = "daily_usage", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer dailyUsage = 0;

    @Column(name = "average_daily_usage", nullable = false, columnDefinition = "double precision default 0.0")
    @Builder.Default
    private Double averageDailyUsage = 0.0;

    @Column(name = "is_alert_active", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isAlertActive = false;

    @Column(name = "consumption_history", columnDefinition = "varchar(255) default ''")
    @Builder.Default
    private String consumptionHistory = "";

    @Transient
    public String getStockStatus() {
        if (stock == 0) return "OUT_OF_STOCK";
        if (stock < threshold) return "LOW_STOCK";
        return "OK";
    }
}
