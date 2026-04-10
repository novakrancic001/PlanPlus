package com.aups.planplus.service;

import com.aups.planplus.model.Inventory;
import com.aups.planplus.model.Material;
import com.aups.planplus.repository.InventoryRepository;
import com.aups.planplus.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final MaterialRepository materialRepository;

    public Inventory addStock(Long materialId, Double quantity){
        // Proveri da li materijal postoji
        Material material = materialRepository.findById(materialId).orElseThrow(() -> new RuntimeException("Materijal nije pronađen!"));

        // Proveri da li vec imamo taj materijal u magacinu
        Inventory inventory = inventoryRepository.findByMaterialId(materialId).orElse(new Inventory()); // ako nema, pravi novi objekat

        if (inventory.getId() == null) {
            inventory.setMaterial(material);
            inventory.setCurrentStock(quantity);
        } else {
            inventory.setCurrentStock(inventory.getCurrentStock() + quantity);
        }

        return inventoryRepository.save(inventory);
    }

    public Double getStockForMaterial(Long materialId){
        return inventoryRepository.findByMaterialId(materialId).map(Inventory::getCurrentStock).orElse(0.0);
    }

    public void reduceStock(Long materialId, Double quantity){
        Inventory inventory = inventoryRepository.findByMaterialId(materialId).orElseThrow(() -> new RuntimeException("Materijal nije u magacinu, nemoguće umanjiti zalihe!"));

        if(inventory.getCurrentStock() < quantity){
            throw new RuntimeException("Nedovoljno stanje na zalihama!");
        }

        inventory.setCurrentStock(inventory.getCurrentStock() - quantity);
        inventoryRepository.save(inventory);
    }
}
