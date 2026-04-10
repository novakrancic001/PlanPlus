package com.aups.planplus.model;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "bom_items")
@Data
public class BOMItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    private Double quantityRequired;
}
