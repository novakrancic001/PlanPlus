package com.aups.planplus.controller;

import com.aups.planplus.dto.WorkOrderRequest;
import com.aups.planplus.model.WorkOrder;
import com.aups.planplus.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping
    public List<WorkOrder> getAllWorkOrders() {
        return workOrderService.getAllWorkOrders();
    }

    @PostMapping
    public WorkOrder createWorkOrder(@RequestBody WorkOrderRequest request) {
        return workOrderService.createWorkOrder(request);
    }

    @PatchMapping("/{id}/cancel")
    public WorkOrder cancelWorkOrder(@PathVariable Long id) {
        return workOrderService.cancelWorkOrder(id);
    }
}