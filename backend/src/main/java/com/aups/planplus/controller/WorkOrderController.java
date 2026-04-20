package com.aups.planplus.controller;

import com.aups.planplus.dto.AssignRequest;
import com.aups.planplus.dto.WorkOrderRequest;
import com.aups.planplus.dto.WorkOrderResponse;
import com.aups.planplus.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('PLANNER','OPERATOR')")
    public List<WorkOrderResponse> getAllWorkOrders(Authentication auth) {
        return workOrderService.getAllWorkOrders(auth);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PLANNER','OPERATOR')")
    public WorkOrderResponse getWorkOrderById(@PathVariable Long id, Authentication auth) {
        return workOrderService.getWorkOrderById(id, auth);
    }

    @PostMapping
    @PreAuthorize("hasRole('PLANNER')")
    public WorkOrderResponse createWorkOrder(@RequestBody WorkOrderRequest request) {
        return workOrderService.createWorkOrder(request);
    }

    @PatchMapping("/{id}/advance")
    @PreAuthorize("hasRole('PLANNER')")
    public WorkOrderResponse advanceStatus(@PathVariable Long id) {
        return workOrderService.advanceStatus(id);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PLANNER')")
    public WorkOrderResponse cancelWorkOrder(@PathVariable Long id) {
        return workOrderService.cancelWorkOrder(id);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('PLANNER')")
    public WorkOrderResponse assignWorkOrder(@PathVariable Long id, @RequestBody AssignRequest request) {
        return workOrderService.assignWorkOrder(id, request.getOperatorId());
    }
}