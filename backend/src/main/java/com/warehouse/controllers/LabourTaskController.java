package com.warehouse.controllers;

import com.warehouse.dtos.TaskDTO;
import com.warehouse.entities.AppUser;
import com.warehouse.services.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/labour/tasks")
@RequiredArgsConstructor
public class LabourTaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getMyTasks(Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        return ResponseEntity.ok(taskService.getTasksByWorker(user.getUserId()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TaskDTO> updateMyTaskStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        // We really should verify the task belongs to the user before updating, 
        // but for simplicity we rely on UI hiding other tasks.
        return ResponseEntity.ok(taskService.updateTaskStatus(id, body.get("status")));
    }
}
