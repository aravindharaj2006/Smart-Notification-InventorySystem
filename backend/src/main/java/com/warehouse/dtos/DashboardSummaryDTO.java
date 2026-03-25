package com.warehouse.dtos;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardSummaryDTO {
    private long totalProducts;
    private long totalVariants;
    private long lowStockVariants;
    private long outOfStockVariants;
    private long pendingTasks;
    private long overdueTasks;
    private long notificationsToday;
    private long unreadNotifications;
    private long totalWorkers;
    private long totalSuppliers;
}
