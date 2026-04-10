package com.aups.planplus.controller;

import com.aups.planplus.model.Inventory;
import com.aups.planplus.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/add")
    public Inventory addStock(@RequestParam Long materialId, @RequestParam Double quantity){
        return inventoryService.addStock(materialId, quantity);
    }
}
