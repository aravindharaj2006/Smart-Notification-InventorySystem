package com.warehouse.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseCleanup {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void cleanUpOrphanedTasks() {
        try {
            jdbcTemplate.execute("DELETE FROM tasks WHERE user_id = 0 OR user_id NOT IN (SELECT user_id FROM app_user)");
            System.out.println("====== DB CLEANUP SUCCESS ======");
        } catch(Exception e) {
            System.out.println("====== DB CLEANUP FAILED ======");
        }
    }
}
