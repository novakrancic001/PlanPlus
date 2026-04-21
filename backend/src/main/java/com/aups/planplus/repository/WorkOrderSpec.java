package com.aups.planplus.repository;

import com.aups.planplus.auth.model.User;
import com.aups.planplus.model.WorkOrder;
import org.springframework.data.jpa.domain.Specification;

public class WorkOrderSpec {

    public static Specification<WorkOrder> hasStatus(WorkOrder.OrderStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<WorkOrder> hasProduct(Long productId) {
        return (root, query, cb) -> productId == null ? null : cb.equal(root.get("product").get("id"), productId);
    }

    public static Specification<WorkOrder> hasAssignedTo(Long userId) {
        return (root, query, cb) -> userId == null ? null : cb.equal(root.get("assignedTo").get("id"), userId);
    }

    public static Specification<WorkOrder> assignedToUser(User user) {
        return (root, query, cb) -> cb.equal(root.get("assignedTo"), user);
    }
}