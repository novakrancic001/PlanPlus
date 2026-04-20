package com.aups.planplus.model;

import com.aups.planplus.auth.model.User;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "work_orders")
@Data
public class WorkOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Double quantity;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    public enum OrderStatus {
        PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}