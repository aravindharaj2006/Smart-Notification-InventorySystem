package com.warehouse.repositories;

import com.warehouse.entities.InventoryAlert;
import com.warehouse.entities.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryAlertRepository extends JpaRepository<InventoryAlert, Long> {
    Optional<InventoryAlert> findByProductVariantAndResolvedFalse(ProductVariant variant);
    List<InventoryAlert> findAllByResolvedFalseOrderByCreatedAtDesc();
}
