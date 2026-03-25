package com.warehouse.services;

import com.warehouse.dtos.NotificationDTO;
import com.warehouse.entities.*;
import com.warehouse.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<NotificationDTO> getByRecipient(String recipient) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<NotificationDTO> getByType(String type) {
        return notificationRepository.findByTypeOrderByCreatedAtDesc(type).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<NotificationDTO> getByPriority(String priority) {
        return notificationRepository.findByPriorityOrderByCreatedAtDesc(priority).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public long countTodayNotifications() {
        return notificationRepository.countByCreatedAtAfter(
                LocalDateTime.now().toLocalDate().atStartOfDay());
    }

    public long countUnread() {
        return notificationRepository.countByStatus("UNREAD");
    }

    public NotificationDTO markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setStatus("READ");
        return toDTO(notificationRepository.save(n));
    }

    public NotificationDTO dismiss(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setStatus("DISMISSED");
        return toDTO(notificationRepository.save(n));
    }

    // ==== BULK ACTIONS ====
    
    public void markAllAsRead() {
        List<Notification> all = notificationRepository.findAll();
        all.forEach(n -> n.setStatus("READ"));
        notificationRepository.saveAll(all);
    }

    public void deleteAll() {
        notificationRepository.deleteAll();
    }

    public void markAllAsReadByRecipient(String recipient) {
        List<Notification> userNotifs = notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient);
        userNotifs.forEach(n -> n.setStatus("READ"));
        notificationRepository.saveAll(userNotifs);
    }

    public void deleteAllByRecipient(String recipient) {
        List<Notification> userNotifs = notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient);
        notificationRepository.deleteAll(userNotifs);
    }

    // ---- Rule-Based Notification Engine ----

    public void checkLowStock(ProductVariant variant) {
        if (variant.getStock() == 0) {
            createNotification(
                    String.format("🚨 OUT OF STOCK ALERT\nProduct: %s\nVariant: %s\nStock: 0\nThreshold: %d",
                            variant.getProduct().getProductName(),
                            variant.getVariantName(),
                            variant.getThreshold()),
                    "CRITICAL",
                    variant.getProduct().getSupplier() != null
                            ? variant.getProduct().getSupplier().getName() : "Admin",
                    "OUT_OF_STOCK"
            );
        } else if (variant.getStock() <= variant.getThreshold()) {
            createNotification(
                    String.format("⚠️ LOW STOCK ALERT\nProduct: %s\nVariant: %s\nStock: %d\nThreshold: %d",
                            variant.getProduct().getProductName(),
                            variant.getVariantName(),
                            variant.getStock(),
                            variant.getThreshold()),
                    "HIGH",
                    "Admin",
                    "LOW_STOCK"
            );
        }
    }

    public void checkOverdueTasks(List<Task> overdueTasks) {
        for (Task task : overdueTasks) {
            String messageWorker = String.format("⏰ TASK REMINDER\nTask: %s\nDeadline: %s\nStatus: OVERDUE",
                    task.getDescription(),
                    task.getDeadline().toString());
            createNotification(messageWorker, "MEDIUM", "USER_" + task.getWorker().getUserId(), "TASK_REMINDER");

            String messageAdmin = String.format("⏰ TASK OVERDUE ALERT\nTask: %s\nAssigned to: %s\nDeadline: %s",
                    task.getDescription(),
                    task.getWorker().getName(),
                    task.getDeadline().toString());
            createNotification(messageAdmin, "HIGH", "ADMINS", "TASK_REMINDER");
        }
    }

    public void notifyNewTask(Task task) {
        String message = String.format("📋 NEW TASK ASSIGNED\nTask: %s\nDeadline: %s",
                task.getDescription(),
                task.getDeadline().toString());
        createNotification(message, "MEDIUM", "USER_" + task.getWorker().getUserId(), "SYSTEM");
    }

    public void createDailyReport(long totalProducts, long lowStock, long outOfStock, long pendingTasks) {
        createNotification(
                String.format("📊 DAILY INVENTORY REPORT\nTotal Products: %d\nLow Stock Variants: %d\nOut of Stock: %d\nPending Tasks: %d",
                        totalProducts, lowStock, outOfStock, pendingTasks),
                "LOW",
                "Admin",
                "DAILY_REPORT"
        );
    }

    public void createNotification(String message, String priority, String recipient, String type) {
        Notification notification = Notification.builder()
                .message(message)
                .priority(priority)
                .recipient(recipient)
                .type(type)
                .status("UNREAD")
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
        log.info("Notification created: [{}] {} -> {}", priority, type, recipient);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .notificationId(n.getNotificationId())
                .message(n.getMessage())
                .priority(n.getPriority())
                .recipient(n.getRecipient())
                .status(n.getStatus())
                .type(n.getType())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
