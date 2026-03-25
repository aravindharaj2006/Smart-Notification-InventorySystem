package com.warehouse.services;

import com.warehouse.entities.Task;
import com.warehouse.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskMonitorService {

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    // Runs every hour
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void monitorOverdueTasks() {
        log.debug("Scanning for overdue tasks and task delays...");
        LocalDateTime now = LocalDateTime.now();
        List<Task> allTasks = taskRepository.findAll();

        List<Task> pendingOverdueTasks = allTasks.stream()
                .filter(Task::isOverdue)
                .collect(Collectors.toList());

        for (Task task : pendingOverdueTasks) {
            // Check if alert was never sent, or if it was > 24 hours ago (Daily)
            if (task.getLastAlertSentAt() == null || task.getLastAlertSentAt().isBefore(now.minusHours(24))) {
                
                // Notify logic: Create system notifications
                String msg = "URGENT: Task #" + task.getTaskId() + " is overdue and needs immediate completion.";
                notificationService.createNotification(msg, "HIGH", "ADMINS", "TASK_REMINDER");
                
                // If possible, we should notify the specific worker
                String workerMsg = "REMINDER: Your task #" + task.getTaskId() + " is overdue. Please complete it ASAP.";
                notificationService.createNotification(workerMsg, "HIGH", "USER_" + task.getWorker().getUserId(), "TASK_REMINDER");

                task.setLastAlertSentAt(now);
                taskRepository.save(task);
                log.info("Sent Delay Alert for Overdue Task #{}", task.getTaskId());
            }
        }
    }
}
