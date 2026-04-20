package com.aups.planplus.controller;

import com.aups.planplus.model.Material;
import com.aups.planplus.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PLANNER')")
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public List<Material> getAllMaterials() { return materialService.getAllMaterials(); }

    @PostMapping
    public Material createMaterial(@RequestBody Material material) {
        return materialService.createMaterial(material);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> updateMaterial(@PathVariable Long id,
                                                   @RequestBody Material material) {
        Material updated = materialService.updateMaterial(id, material);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        try {
            materialService.deleteMaterial(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}