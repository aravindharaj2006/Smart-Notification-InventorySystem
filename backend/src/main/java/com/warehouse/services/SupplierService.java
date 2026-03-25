package com.warehouse.services;

import com.warehouse.dtos.SupplierDTO;
import com.warehouse.entities.Supplier;
import com.warehouse.repositories.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public SupplierDTO getSupplier(Long id) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        return toDTO(s);
    }

    public SupplierDTO createSupplier(SupplierDTO dto) {
        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .build();
        return toDTO(supplierRepository.save(supplier));
    }

    public SupplierDTO updateSupplier(Long id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplier.setName(dto.getName());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        return toDTO(supplierRepository.save(supplier));
    }

    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }

    private SupplierDTO toDTO(Supplier s) {
        return SupplierDTO.builder()
                .supplierId(s.getSupplierId())
                .name(s.getName())
                .email(s.getEmail())
                .phone(s.getPhone())
                .productCount(s.getProducts() != null ? s.getProducts().size() : 0)
                .build();
    }
}
