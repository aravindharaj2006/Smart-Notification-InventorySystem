package com.warehouse.controllers;

import com.warehouse.dtos.NotificationDTO;
import com.warehouse.entities.AppUser;
import com.warehouse.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/labour/notifications")
@RequiredArgsConstructor
public class LabourNotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        return ResponseEntity.ok(notificationService.getByRecipient("USER_" + user.getUserId()));
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
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        notificationService.markAllAsReadByRecipient("USER_" + user.getUserId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete-all")
    public ResponseEntity<Void> deleteAll(Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        notificationService.deleteAllByRecipient("USER_" + user.getUserId());
        return ResponseEntity.ok().build();
    }
}
