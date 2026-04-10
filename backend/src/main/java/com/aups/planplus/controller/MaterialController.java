package com.aups.planplus.controller;

import com.aups.planplus.model.Material;
import com.aups.planplus.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public List<Material> getAllMaterials() { return materialService.getAllMaterials(); }

    @PostMapping
    public Material createMaterial(@RequestBody Material material){
        return materialService.createMaterial(material);
    }
}
