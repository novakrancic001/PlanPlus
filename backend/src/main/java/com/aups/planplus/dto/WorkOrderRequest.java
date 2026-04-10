package com.aups.planplus.dto;

import lombok.Data;

@Data
public class WorkOrderRequest {
    private Long productId;
    private Double quantity;
}
