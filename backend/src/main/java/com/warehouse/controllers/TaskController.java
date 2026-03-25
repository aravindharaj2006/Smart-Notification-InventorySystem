package com.warehouse.controllers;

import com.warehouse.dtos.TaskDTO;
import com.warehouse.dtos.AppUserDTO;
import com.warehouse.services.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // ---- Workers ----

    @GetMapping("/workers")
    public ResponseEntity<List<AppUserDTO>> getAllWorkers() {
        return ResponseEntity.ok(taskService.getAllWorkers());
    }

    @PostMapping("/workers")
    public ResponseEntity<AppUserDTO> createWorker(@RequestBody AppUserDTO dto) {
        return ResponseEntity.ok(taskService.createWorker(dto));
    }

    @PutMapping("/workers/{id}")
    public ResponseEntity<AppUserDTO> updateWorker(@PathVariable Long id, @RequestBody AppUserDTO dto) {
        return ResponseEntity.ok(taskService.updateWorker(id, dto));
    }

    @DeleteMapping("/workers/{id}")
    public ResponseEntity<Void> deleteWorker(@PathVariable Long id) {
        taskService.deleteWorker(id);
        return ResponseEntity.ok().build();
    }

    // ---- Tasks ----

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/tasks/status/{status}")
    public ResponseEntity<List<TaskDTO>> getTasksByStatus(@PathVariable String status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }

    @GetMapping("/tasks/worker/{workerId}")
    public ResponseEntity<List<TaskDTO>> getTasksByWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(taskService.getTasksByWorker(workerId));
    }

    @GetMapping("/tasks/overdue")
    public ResponseEntity<List<TaskDTO>> getOverdueTasks() {
        return ResponseEntity.ok(taskService.getOverdueTasks());
    }

    @PostMapping("/tasks")
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.createTask(dto));
    }

    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<TaskDTO> updateTaskStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, body.get("status")));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }
}
