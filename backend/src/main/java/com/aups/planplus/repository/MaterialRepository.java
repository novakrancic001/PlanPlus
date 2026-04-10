package com.aups.planplus.repository;

import com.aups.planplus.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    Material findBySku(String sku);
}
