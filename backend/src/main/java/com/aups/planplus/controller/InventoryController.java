package com.aups.planplus.controller;

import com.aups.planplus.model.Inventory;
import com.aups.planplus.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PLANNER')")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/add")
    public Inventory addStock(@RequestParam Long materialId, @RequestParam Double quantity) {
        return inventoryService.addStock(materialId, quantity);
    }

    @GetMapping
    public Page<Inventory> getAllInventory(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "currentStock", direction = Sort.Direction.DESC) Pageable pageable) {
        return inventoryService.getAllInventory(search, pageable);
    }
}