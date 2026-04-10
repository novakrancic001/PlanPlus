package com.aups.planplus.dto;

import lombok.Data;

@Data
public class BOMItemRequest {
    private Long productId;
    private Long materialId;
    private Double quantityRequired;
}
