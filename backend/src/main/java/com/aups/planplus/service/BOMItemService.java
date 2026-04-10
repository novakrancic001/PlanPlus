package com.aups.planplus.service;

import com.aups.planplus.dto.BOMItemRequest;
import com.aups.planplus.model.BOMItem;
import com.aups.planplus.model.Material;
import com.aups.planplus.model.Product;
import com.aups.planplus.repository.BOMItemRepository;
import com.aups.planplus.repository.MaterialRepository;
import com.aups.planplus.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BOMItemService {

    private final BOMItemRepository bomItemRepository;
    private final ProductRepository productRepository;
    private final MaterialRepository materialRepository;

    public BOMItem addMaterialToProduct(BOMItemRequest request){
        Product product = productRepository.findById(request.getProductId()).orElseThrow(() -> new RuntimeException("Proizvod sa ID " + request.getProductId() + " nije pronađen!"));

        Material material = materialRepository.findById(request.getMaterialId()).orElseThrow(() -> new RuntimeException("Materijal sa ID " + request.getMaterialId() + " nije pronađen!"));

        List<BOMItem> existingItems = bomItemRepository.findByProductId(product.getId());
        for (BOMItem item : existingItems) {
            if (item.getMaterial().getId().equals(material.getId())){
                throw new RuntimeException("Ovaj materijal je već dodat u sastavnicu ovog proizvoda!");
            }
        }

        BOMItem newBOMItem = new BOMItem();
        newBOMItem.setProduct(product);
        newBOMItem.setMaterial(material);
        newBOMItem.setQuantityRequired(request.getQuantityRequired());

        return bomItemRepository.save(newBOMItem);
    }

    public List<BOMItem> getBomForProduct(Long productId){
        return bomItemRepository.findByProductId(productId);
    }
}
