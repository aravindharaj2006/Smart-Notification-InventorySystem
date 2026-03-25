package com.warehouse.controllers;

import com.warehouse.dtos.NotificationDTO;
import com.warehouse.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<NotificationDTO>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(notificationService.getByType(type));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<NotificationDTO>> getByPriority(@PathVariable String priority) {
        return ResponseEntity.ok(notificationService.getByPriority(priority));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/{id}/dismiss")
    public ResponseEntity<NotificationDTO> dismiss(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.dismiss(id));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete-all")
    public ResponseEntity<Void> deleteAll() {
        notificationService.deleteAll();
        return ResponseEntity.ok().build();
    }
}
