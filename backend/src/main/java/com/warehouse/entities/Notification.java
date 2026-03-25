package com.warehouse.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW

    private String recipient;

    @Column(nullable = false)
    @Builder.Default
    private String status = "UNREAD"; // UNREAD, READ, DISMISSED

    @Column(nullable = false)
    @Builder.Default
    private String type = "SYSTEM"; // LOW_STOCK, OUT_OF_STOCK, TASK_REMINDER, DAILY_REPORT, SYSTEM

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
