package com.aups.planplus.controller;

import com.aups.planplus.dto.WorkOrderRequest;
import com.aups.planplus.model.WorkOrder;
import com.aups.planplus.repository.WorkOrderRepository;
import com.aups.planplus.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final WorkOrderRepository workOrderRepository;

    // Kreiranje novog radnog naloga
    @PostMapping
    public WorkOrder createWorkOrder(@RequestBody WorkOrderRequest request){
        return workOrderService.createWorkOrder(request);
    }

    @GetMapping
    public List<WorkOrder> getAllWorkOrders(){
        return workOrderRepository.findAll();
    }
}
