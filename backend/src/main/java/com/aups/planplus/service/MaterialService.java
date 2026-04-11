package com.aups.planplus.service;

import com.aups.planplus.model.Material;
import com.aups.planplus.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
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
