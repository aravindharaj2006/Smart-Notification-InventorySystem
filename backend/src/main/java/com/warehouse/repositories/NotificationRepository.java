package com.warehouse.repositories;

import com.warehouse.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByTypeOrderByCreatedAtDesc(String type);

    List<Notification> findByRecipientOrderByCreatedAtDesc(String recipient);

    List<Notification> findByPriorityOrderByCreatedAtDesc(String priority);

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByStatusOrderByCreatedAtDesc(String status);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    long countByStatus(String status);
}
