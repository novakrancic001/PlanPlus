package com.aups.planplus.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data // Automatski pravi getere, setere, toString, equals i hashCode
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Šifra proizvoda je obavezna")
    @Column(unique = true, nullable = false)
    private String sku; // Stock Keeping Unit (jedinstvena šifra)

    @NotBlank(message = "Naziv proizvoda je obavezan")
    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private Unit unit; // npr. komad (PCS), kilogram (KG)

    public enum Unit {
        PCS, KG, M, L
    }

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<BOMItem> bomItems = new ArrayList<>();
}