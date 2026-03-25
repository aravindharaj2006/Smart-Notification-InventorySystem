package com.warehouse.repositories;

import com.warehouse.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(String status);

    List<Task> findByWorker_UserId(Long userId);

    @Query("SELECT t FROM Task t WHERE t.status = 'PENDING' AND t.deadline < CURRENT_TIMESTAMP")
    List<Task> findOverdueTasks();

    long countByStatus(String status);
}
