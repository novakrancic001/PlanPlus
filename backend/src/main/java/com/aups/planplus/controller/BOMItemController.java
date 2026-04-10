package com.aups.planplus.controller;

import com.aups.planplus.dto.BOMItemRequest;
import com.aups.planplus.model.BOMItem;
import com.aups.planplus.service.BOMItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bom")
@RequiredArgsConstructor
public class BOMItemController {
    private final BOMItemService bomItemService;

    @PostMapping
    public BOMItem addMaterialToBom(@RequestBody BOMItemRequest request){
        return bomItemService.addMaterialToProduct(request);
    }

    @GetMapping("/product/{productId}")
    public List<BOMItem> getBomForProduct(@PathVariable Long productId){
        return bomItemService.getBomForProduct(productId);
    }
}
