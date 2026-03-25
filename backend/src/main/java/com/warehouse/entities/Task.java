package com.warehouse.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser worker;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(nullable = false)
    private LocalDateTime deadline;

    private LocalDateTime completedAt;

    @Column(name = "last_alert_sent_at")
    private LocalDateTime lastAlertSentAt;

    @Transient
    public boolean isOverdue() {
        return "PENDING".equalsIgnoreCase(status) && LocalDateTime.now().isAfter(deadline);
    }
}
