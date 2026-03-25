package com.warehouse.repositories;

import com.warehouse.entities.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProduct_ProductId(Long productId);

    @Query("SELECT v FROM ProductVariant v WHERE v.stock <= v.threshold AND v.stock > 0")
    List<ProductVariant> findLowStockVariants();

    @Query("SELECT v FROM ProductVariant v WHERE v.stock = 0")
    List<ProductVariant> findOutOfStockVariants();

    @Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.stock <= v.threshold AND v.stock > 0")
    long countLowStockVariants();

    @Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.stock = 0")
    long countOutOfStockVariants();
}
