package com.aups.planplus.repository;

import com.aups.planplus.model.BOMItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BOMItemRepository extends JpaRepository<BOMItem, Long> {
    List<BOMItem> findByProductId(Long productId);
}
