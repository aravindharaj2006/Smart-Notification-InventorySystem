package com.warehouse.dtos;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDTO {
    private Long notificationId;
    private String message;
    private String priority;
    private String recipient;
    private String status;
    private String type;
    private LocalDateTime createdAt;
}
