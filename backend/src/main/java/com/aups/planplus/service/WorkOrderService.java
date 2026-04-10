package com.aups.planplus.service;

import com.aups.planplus.dto.WorkOrderRequest;
import com.aups.planplus.model.BOMItem;
import com.aups.planplus.model.Product;
import com.aups.planplus.model.WorkOrder;
import com.aups.planplus.repository.BOMItemRepository;
import com.aups.planplus.repository.ProductRepository;
import com.aups.planplus.repository.WorkOrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final ProductRepository productRepository;
    private final BOMItemRepository bomItemRepository;
    private final InventoryService inventoryService;

    @Transactional
    public WorkOrder createWorkOrder(WorkOrderRequest request){
        // 1. Pronadji proizvod
        Product product = productRepository.findById(request.getProductId()).orElseThrow(() -> new RuntimeException("Proizvod nije pronađen!"));

        // 2. Pronadji sastavnicu za taj proizvod
        List<BOMItem> bomItems = bomItemRepository.findByProductId(product.getId());
        if (bomItems.isEmpty()) {
            throw new RuntimeException("Proizvod nema definisanu sastavnicu!");

        }

        // 3. Provera zaliha
        for (BOMItem item : bomItems){
            Double neededTotal = item.getQuantityRequired() * request.getQuantity();
            Double available = inventoryService.getStockForMaterial(item.getMaterial().getId());

            if (available < neededTotal){
                throw new RuntimeException("Nedovoljno zaliha za materijal: " + item.getMaterial().getName() + ". Potrebno: " + neededTotal + ", Dostupno: " + available);
            }
        }

        for (BOMItem item : bomItems){
            Double neededTotal = item.getQuantityRequired() * request.getQuantity();
            inventoryService.reduceStock(item.getMaterial().getId(), neededTotal);
        }

        // 4. Ako je sve OK, kreiraj nalog
        WorkOrder order = new WorkOrder();
        order.setProduct(product);
        order.setQuantity(request.getQuantity());
        order.setStatus(WorkOrder.OrderStatus.PLANNED);
        order.setCreatedAt(LocalDateTime.now());

        return workOrderRepository.save(order);
    }
}
