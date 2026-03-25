package com.warehouse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WarehouseIntelligenceApplication {
    public static void main(String[] args) {
        SpringApplication.run(WarehouseIntelligenceApplication.class, args);
    }
}
