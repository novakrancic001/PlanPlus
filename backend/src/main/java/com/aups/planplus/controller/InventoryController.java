package com.aups.planplus.controller;

import com.aups.planplus.model.Inventory;
import com.aups.planplus.repository.InventoryRepository;
import com.aups.planplus.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PLANNER')")
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository;

    @PostMapping("/add")
    public Inventory addStock(@RequestParam Long materialId, @RequestParam Double quantity) {
        return inventoryService.addStock(materialId, quantity);
    }

    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }
}