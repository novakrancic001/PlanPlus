package com.aups.planplus.controller;

import com.aups.planplus.dto.WorkOrderRequest;
import com.aups.planplus.model.WorkOrder;
import com.aups.planplus.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    // Kreiranje novog radnog naloga
    @PostMapping
    public WorkOrder createWorkOrder(@RequestBody WorkOrderRequest request){
        return workOrderService.createWorkOrder(request);
    }
}
