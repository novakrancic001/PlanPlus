package com.aups.planplus.model;

import jakarta.persistence.*;
import jdk.jfr.Unsigned;
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

    public enum OrderStatus {
        PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
