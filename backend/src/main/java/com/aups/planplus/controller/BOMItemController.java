package com.aups.planplus.controller;

import com.aups.planplus.dto.BOMItemRequest;
import com.aups.planplus.model.BOMItem;
import com.aups.planplus.service.BOMItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bom")
@RequiredArgsConstructor
public class BOMItemController {

    private final BOMItemService bomItemService;

    @PostMapping
    @PreAuthorize("hasRole('PLANNER')")
    public BOMItem addMaterialToBom(@RequestBody BOMItemRequest request) {
        return bomItemService.addMaterialToProduct(request);
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('PLANNER','OPERATOR')")
    public List<BOMItem> getBomForProduct(@PathVariable Long productId) {
        return bomItemService.getBomForProduct(productId);
    }
}