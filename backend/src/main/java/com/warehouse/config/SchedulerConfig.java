package com.warehouse.config;

import com.warehouse.repositories.ProductRepository;
import com.warehouse.repositories.ProductVariantRepository;
import com.warehouse.repositories.TaskRepository;
import com.warehouse.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerConfig {

    private final ProductVariantRepository variantRepository;
    private final TaskRepository taskRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;


    /**
     * Generate daily inventory report at midnight.
     */
    @Scheduled(cron = "0 0 0 * * *") // midnight daily
    public void generateDailyReport() {
        log.info("=== Generating Daily Inventory Report ===");
        long totalProducts = productRepository.count();
        long lowStock = variantRepository.countLowStockVariants();
        long outOfStock = variantRepository.countOutOfStockVariants();
        long pendingTasks = taskRepository.countByStatus("PENDING");
        notificationService.createDailyReport(totalProducts, lowStock, outOfStock, pendingTasks);
        log.info("Daily report generated successfully.");
    }
}
