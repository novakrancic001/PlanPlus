package com.aups.planplus.repository;

import com.aups.planplus.auth.model.User;
import com.aups.planplus.model.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByProductId(Long productId);

    boolean existsByProductIdAndStatusIn(Long productId, List<WorkOrder.OrderStatus> statuses);

    List<WorkOrder> findByAssignedTo(User user);

    Optional<WorkOrder> findByIdAndAssignedTo(Long id, User user);

    int countByAssignedToAndStatusIn(User user, List<WorkOrder.OrderStatus> statuses);
}
