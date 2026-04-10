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
}
