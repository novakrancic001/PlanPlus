package com.aups.planplus.service;

import com.aups.planplus.model.Material;
import com.aups.planplus.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;

    public Page<Material> getAllMaterials(String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return materialRepository.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(search, search, pageable);
        }
        return materialRepository.findAll(pageable);
    }

    public Material createMaterial(Material material){
        Material existingMaterial = materialRepository.findBySku(material.getSku());

        if (existingMaterial != null){
            throw new RuntimeException("Materijal sa šifrom " + material.getSku() + " već postoji!");
        }

        return materialRepository.save(material);
    }

    public Material updateMaterial(Long id, Material updatedMaterial) {
        Material existing = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found: " + id));
        existing.setName(updatedMaterial.getName());
        existing.setUnit(updatedMaterial.getUnit());
        return materialRepository.save(existing);
    }

    public void deleteMaterial(Long id) {
        if (!materialRepository.existsById(id)) {
            throw new RuntimeException("Material not found: " + id);
        }
        materialRepository.deleteById(id);
    }
}
