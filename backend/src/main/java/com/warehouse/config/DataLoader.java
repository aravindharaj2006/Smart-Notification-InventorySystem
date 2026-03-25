package com.warehouse.config;

import com.warehouse.entities.*;
import com.warehouse.repositories.*;
import com.warehouse.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final AppUserRepository appUserRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    @Override
    public void run(String... args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String defaultPassword = encoder.encode("password");

        log.info("Checking and verifying user accounts...");
        
        // 1. Ensure Admin exists
        if (appUserRepository.findByEmail("admin@gmail.com").isEmpty()) {
            appUserRepository.save(AppUser.builder()
                .name("Admin User").email("admin@gmail.com").password(defaultPassword).role(Role.ADMIN).build());
        }

        // 2. Fix legacy workers that were added before authentication was implemented
        List<AppUser> users = appUserRepository.findAll();
        for (AppUser u : users) {
            boolean updated = false;
            if (u.getPassword() == null || u.getPassword().isEmpty()) {
                u.setPassword(defaultPassword);
                updated = true;
            }
            if (u.getEmail() == null || u.getEmail().isEmpty()) {
                // Generate an email from their name (e.g., "John Smith" -> "johnsmith@example.com")
                u.setEmail(u.getName().replaceAll("\\s+", "").toLowerCase() + "@example.com");
                updated = true;
            }
            if (u.getRole() == null) {
                u.setRole(Role.LABOUR);
                updated = true;
            }
            if (updated) {
                appUserRepository.save(u);
            }
        }

        if (productRepository.count() > 0) {
            log.info("Sample data already exists. Skipping sample products/tasks load.");
            return;
        }

        log.info("Loading sample data...");

        AppUser labour1 = appUserRepository.findByEmail("johnsmith@example.com")
            .orElseGet(() -> appUserRepository.save(AppUser.builder()
                .name("John Smith").email("johnsmith@example.com").password(defaultPassword).role(Role.LABOUR).build()));
                
        AppUser labour2 = appUserRepository.findByEmail("mariagarcia@example.com")
            .orElseGet(() -> appUserRepository.save(AppUser.builder()
                .name("Maria Garcia").email("mariagarcia@example.com").password(defaultPassword).role(Role.LABOUR).build()));
                
        AppUser labour3 = appUserRepository.findByEmail("jameswilson@example.com")
            .orElseGet(() -> appUserRepository.save(AppUser.builder()
                .name("James Wilson").email("jameswilson@example.com").password(defaultPassword).role(Role.LABOUR).build()));

        // Suppliers
        Supplier s1 = supplierRepository.save(Supplier.builder()
                .name("Coca-Cola Distribution").email("orders@cocacola.com").phone("+1-555-0101").build());
        Supplier s2 = supplierRepository.save(Supplier.builder()
                .name("Dell Technologies").email("supply@dell.com").phone("+1-555-0102").build());

        // Products
        Product p1 = productRepository.save(Product.builder().productName("Soft Drink").supplier(s1).build());
        Product p2 = productRepository.save(Product.builder().productName("Laptop").supplier(s2).build());

        // Product Variants
        List<ProductVariant> variants = List.of(
            ProductVariant.builder().product(p1).variantName("Cola").stock(120).threshold(50).build(),
            ProductVariant.builder().product(p1).variantName("Orange").stock(10).threshold(30).build(),
            ProductVariant.builder().product(p2).variantName("Dell i7 16GB").stock(0).threshold(5).build(),
            ProductVariant.builder().product(p2).variantName("Dell i5 8GB").stock(15).threshold(10).build()
        );
        variantRepository.saveAll(variants);

        // Generate stock notifications
        variants.forEach(notificationService::checkLowStock);

        // Tasks
        taskRepository.saveAll(List.of(
            Task.builder().worker(labour1).description("Pick items for Order #1042")
                .status("PENDING").deadline(LocalDateTime.now().minusHours(2)).build(),
            Task.builder().worker(labour1).description("Arrange soft drink racks")
                .status("IN_PROGRESS").deadline(LocalDateTime.now().plusHours(4)).build(),
            Task.builder().worker(labour2).description("Unload shipment from Truck #78")
                .status("COMPLETED").deadline(LocalDateTime.now().minusHours(6))
                .completedAt(LocalDateTime.now().minusHours(7)).build(),
            Task.builder().worker(labour3).description("Count inventory in Section C")
                .status("PENDING").deadline(LocalDateTime.now().plusDays(1)).build()
        ));

        log.info("Sample data loaded successfully. Default login passwords are 'password'.");
    }
}
