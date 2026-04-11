package com.aups.planplus.repository;

import com.aups.planplus.model.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByProductId(Long productId);

    boolean existsByProductIdAndStatusIn(Long productId, List<WorkOrder.OrderStatus> statuses);
}
