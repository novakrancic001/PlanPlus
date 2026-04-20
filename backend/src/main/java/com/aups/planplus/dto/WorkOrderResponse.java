package com.aups.planplus.dto;

import com.aups.planplus.auth.dto.UserResponse;
import com.aups.planplus.model.WorkOrder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderResponse {

    private Long id;
    private Long productId;
    private String productName;
    private Double quantity;
    private WorkOrder.OrderStatus status;
    private LocalDateTime createdAt;
    private UserResponse assignedTo;

    public static WorkOrderResponse from(WorkOrder order) {
        return new WorkOrderResponse(
                order.getId(),
                order.getProduct().getId(),
                order.getProduct().getName(),
                order.getQuantity(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getAssignedTo() != null ? UserResponse.from(order.getAssignedTo()) : null
        );
    }
}
