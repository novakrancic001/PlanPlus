package com.aups.planplus.workload;

import com.aups.planplus.auth.model.Role;
import com.aups.planplus.auth.model.User;
import com.aups.planplus.auth.repository.UserRepository;
import com.aups.planplus.model.WorkOrder.OrderStatus;
import com.aups.planplus.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkloadService {

    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;

    private static final List<OrderStatus> ACTIVE_STATUSES = List.of(
            OrderStatus.PLANNED, OrderStatus.IN_PROGRESS
    );

    public List<OperatorWorkloadDTO> getOperatorWorkload() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.OPERATOR)
                .map(this::toWorkloadDTO)
                .toList();
    }

    private OperatorWorkloadDTO toWorkloadDTO(User user) {
        int activeOrders = workOrderRepository.countByAssignedToAndStatusIn(user, ACTIVE_STATUSES);
        return OperatorWorkloadDTO.of(user, activeOrders);
    }
}