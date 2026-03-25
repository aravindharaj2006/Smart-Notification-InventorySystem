package com.warehouse.services;

import com.warehouse.dtos.TaskDTO;
import com.warehouse.dtos.AppUserDTO;
import com.warehouse.entities.Task;
import com.warehouse.entities.AppUser;
import com.warehouse.entities.Role;
import com.warehouse.repositories.TaskRepository;
import com.warehouse.repositories.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // ---- Users (Workers/Admins) ----

    @Transactional(readOnly = true)
    public List<AppUserDTO> getAllWorkers() {
        return appUserRepository.findAll().stream()
                .map(this::toUserDTO).collect(Collectors.toList());
    }

    public AppUserDTO createWorker(AppUserDTO dto) {
        // Use provided password or default to "password"
        String rawPassword = (dto.getPassword() != null && !dto.getPassword().isEmpty())
                ? dto.getPassword() : "password";
        AppUser user = AppUser.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .role(dto.getRole() != null ? dto.getRole() : Role.LABOUR)
                .password(passwordEncoder.encode(rawPassword))
                .build();
        return toUserDTO(appUserRepository.save(user));
    }

    public AppUserDTO updateWorker(Long id, AppUserDTO dto) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        user.setName(dto.getName());
        user.setRole(dto.getRole());
        return toUserDTO(appUserRepository.save(user));
    }

    public void deleteWorker(Long id) {
        appUserRepository.deleteById(id);
    }

    // ---- Tasks ----

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::toTaskDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status).stream()
                .map(this::toTaskDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByWorker(Long workerId) {
        return taskRepository.findByWorker_UserId(workerId).stream()
                .map(this::toTaskDTO).collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO createTask(TaskDTO dto) {
        AppUser worker = appUserRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        Task task = Task.builder()
                .worker(worker)
                .description(dto.getDescription())
                .status("PENDING")
                .deadline(dto.getDeadline())
                .build();
        
        Task savedTask = taskRepository.save(task);

        // Notify the worker that a new task was assigned
        notificationService.notifyNewTask(savedTask);

        return toTaskDTO(savedTask);
    }

    @Transactional
    public TaskDTO updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        if ("COMPLETED".equalsIgnoreCase(status)) {
            task.setCompletedAt(LocalDateTime.now());
        }
        return toTaskDTO(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public List<TaskDTO> getOverdueTasks() {
        return taskRepository.findOverdueTasks().stream()
                .map(this::toTaskDTO).collect(Collectors.toList());
    }

    public long countPendingTasks() {
        return taskRepository.countByStatus("PENDING");
    }

    public long countOverdueTasks() {
        return taskRepository.findOverdueTasks().size();
    }

    // ---- Mappers ----

    private AppUserDTO toUserDTO(AppUser w) {
        return AppUserDTO.builder()
                .id(w.getUserId())
                .name(w.getName())
                .email(w.getEmail())
                .role(w.getRole())
                .taskCount(w.getTasks() != null ? w.getTasks().size() : 0)
                .build();
    }

    private TaskDTO toTaskDTO(Task t) {
        return TaskDTO.builder()
                .taskId(t.getTaskId())
                .userId(t.getWorker().getUserId())
                .userName(t.getWorker().getName())
                .description(t.getDescription())
                .status(t.getStatus())
                .deadline(t.getDeadline())
                .completedAt(t.getCompletedAt())
                .overdue(t.isOverdue())
                .build();
    }
}
