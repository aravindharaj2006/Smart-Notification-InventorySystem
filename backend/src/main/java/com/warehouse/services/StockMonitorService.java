package com.warehouse.services;

import com.warehouse.entities.InventoryAlert;
import com.warehouse.entities.ProductVariant;
import com.warehouse.entities.Supplier;
import com.warehouse.repositories.InventoryAlertRepository;
import com.warehouse.repositories.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockMonitorService {

    private final ProductVariantRepository productVariantRepository;
    private final InventoryAlertRepository inventoryAlertRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // Run every 60 seconds
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void monitorStockLevels() {
        log.debug("Scanning inventory for low stock levels...");

        LocalDateTime now = LocalDateTime.now();
        List<ProductVariant> allVariants = productVariantRepository.findAll();

        for (ProductVariant variant : allVariants) {
            boolean isUnderThreshold = variant.getStock() <= variant.getThreshold();
            String currentStatus = variant.getStockStatus(); // "OK", "LOW_STOCK", "OUT_OF_STOCK"

            if ("OK".equals(currentStatus) && isUnderThreshold) {
                currentStatus = "LOW_STOCK"; 
            }

            if (!isUnderThreshold && "OK".equals(currentStatus)) {
                // If variant has restocked above threshold, completely clear out all trackers Back to default
                if (variant.isAlertActive()) {
                    variant.setAlertActive(false);
                    variant.setLastAlertSentAt(null);
                    variant.setLastEmailSentAt(null);
                    productVariantRepository.save(variant);

                    // Decommission the dashboard log history entry
                    inventoryAlertRepository.findByProductVariantAndResolvedFalse(variant).ifPresent(alert -> {
                        alert.setResolved(true);
                        alert.setResolvedAt(LocalDateTime.now());
                        inventoryAlertRepository.save(alert);
                    });
                    log.info("Alert restocked and trackers reset for Product {} Variant {}", variant.getProduct().getProductName(), variant.getVariantName());
                }
            } else {
                // Triggers Low or Out of Stock conditions (Will explicitly suppress duplicate daily triggers mathematically)
                boolean stateChanged = false;

                if (!variant.isAlertActive()) {
                    variant.setAlertActive(true);
                    stateChanged = true;
                }

                // Determine the interval delay based on severity
                long hoursDelay = "OUT_OF_STOCK".equals(currentStatus) ? 8 : 24;

                // 1. Process Internal Admin UI Notifications
                if (variant.getLastAlertSentAt() == null || variant.getLastAlertSentAt().isBefore(now.minusHours(hoursDelay))) {
                    notificationService.checkLowStock(variant);
                    variant.setLastAlertSentAt(now);
                    stateChanged = true;
                    log.info("Triggered Scheduled Admin Notification for {} [{}]", variant.getVariantName(), currentStatus);
                }

                // 2. Process Supplier Automations and Emails
                if (variant.getLastEmailSentAt() == null || variant.getLastEmailSentAt().isBefore(now.minusHours(hoursDelay))) {
                    Supplier supplier = variant.getProduct().getSupplier();
                    if (supplier != null) {
                        emailService.sendLowStockAlertEmail(supplier, variant, currentStatus);
                        variant.setLastEmailSentAt(now);
                        stateChanged = true;

                        // Verify if Dashboard history already actively tracks it, so it doesnt populate duplicates
                        Optional<InventoryAlert> activeAlertOpt = inventoryAlertRepository.findByProductVariantAndResolvedFalse(variant);
                        if (activeAlertOpt.isEmpty()) {
                            InventoryAlert newAlert = InventoryAlert.builder()
                                    .productVariant(variant)
                                    .status(currentStatus)
                                    .resolved(false)
                                    .createdAt(LocalDateTime.now())
                                    .build();
                            inventoryAlertRepository.save(newAlert);
                        } else {
                            InventoryAlert existing = activeAlertOpt.get();
                            if (!existing.getStatus().equals(currentStatus)) {
                                existing.setStatus(currentStatus);
                                inventoryAlertRepository.save(existing);
                            }
                        }
                    } else {
                        log.warn("Cannot send email alert: Product {} has no mapped supplier configured.", variant.getProduct().getProductName());
                    }
                }

                if (stateChanged) {
                    productVariantRepository.save(variant);
                }
            }
        }
    }

    // Run every day at midnight (Server processing logic for Dynamic Threshold Adjustment)
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void adjustDynamicThresholds() {
        log.info("Calculating dynamic stock thresholds based on average daily usage...");
        List<ProductVariant> allVariants = productVariantRepository.findAll();

        for (ProductVariant variant : allVariants) {
            Integer dailyUsage = variant.getDailyUsage() != null ? variant.getDailyUsage() : 0;
            Double avgUsage = variant.getAverageDailyUsage() != null ? variant.getAverageDailyUsage() : 0.0;

            // Simple rolling average over a 7-day approximation
            double newAvg = (avgUsage * 6.0 + dailyUsage) / 7.0;
            variant.setAverageDailyUsage(newAvg);

            // Calculate new threshold: ensure we hold at least 3 days of stock for safety, minimum 5
            int dynamicThreshold = Math.max(5, (int) Math.ceil(newAvg * 3.0));

            // Don't overwrite pattern-matched threshold if pattern bumped it higher than our daily average currently says.
            // But we should allow standard dynamic calculation to take over if there's no pattern recently!
            // We'll just use the regular dynamic limit, but make sure not to drop it if recent transactions pushed it high.
            variant.setThreshold(Math.max(variant.getThreshold(), dynamicThreshold));
            
            // Reset daily consumption counter
            variant.setDailyUsage(0);

            productVariantRepository.save(variant);
        }
        log.info("Successfully calculated new thresholds for {} variants.", allVariants.size());
    }
}
