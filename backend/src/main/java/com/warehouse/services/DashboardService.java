package com.warehouse.services;

import com.warehouse.dtos.DashboardSummaryDTO;
import com.warehouse.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;
    private final SupplierRepository supplierRepository;

    public DashboardSummaryDTO getSummary() {
        return DashboardSummaryDTO.builder()
                .totalProducts(productRepository.count())
                .totalVariants(variantRepository.count())
                .lowStockVariants(variantRepository.countLowStockVariants())
                .outOfStockVariants(variantRepository.countOutOfStockVariants())
                .pendingTasks(taskRepository.countByStatus("PENDING"))
                .overdueTasks(taskRepository.findOverdueTasks().size())
                .notificationsToday(notificationRepository.countByCreatedAtAfter(
                        LocalDateTime.now().toLocalDate().atStartOfDay()))
                .unreadNotifications(notificationRepository.countByStatus("UNREAD"))
                .totalWorkers(appUserRepository.count())
                .totalSuppliers(supplierRepository.count())
                .build();
    }
}
