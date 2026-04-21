package com.aups.planplus.service;

import com.aups.planplus.auth.model.Role;
import com.aups.planplus.auth.model.User;
import com.aups.planplus.auth.repository.UserRepository;
import com.aups.planplus.dto.WorkOrderRequest;
import com.aups.planplus.dto.WorkOrderResponse;
import com.aups.planplus.model.BOMItem;
import com.aups.planplus.model.Product;
import com.aups.planplus.model.WorkOrder;
import com.aups.planplus.repository.BOMItemRepository;
import com.aups.planplus.repository.ProductRepository;
import com.aups.planplus.repository.WorkOrderRepository;
import com.aups.planplus.repository.WorkOrderSpec;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
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
    private final UserRepository userRepository;

    public Page<WorkOrderResponse> getAllWorkOrders(Authentication auth,
                                                    WorkOrder.OrderStatus status,
                                                    Long productId,
                                                    Long assignedToId,
                                                    Pageable pageable) {
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen!"));

        Specification<WorkOrder> spec = Specification.where(WorkOrderSpec.hasStatus(status))
                .and(WorkOrderSpec.hasProduct(productId))
                .and(WorkOrderSpec.hasAssignedTo(assignedToId));

        if (currentUser.getRole() == Role.OPERATOR) {
            spec = spec.and(WorkOrderSpec.assignedToUser(currentUser));
        }

        return workOrderRepository.findAll(spec, pageable).map(WorkOrderResponse::from);
    }

    public WorkOrderResponse getWorkOrderById(Long id, Authentication auth) {
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen!"));

        if (currentUser.getRole() == Role.OPERATOR) {
            return workOrderRepository.findByIdAndAssignedTo(id, currentUser)
                    .map(WorkOrderResponse::from)
                    .orElseThrow(() -> new AccessDeniedException("Pristup odbijen"));
        }

        return workOrderRepository.findById(id)
                .map(WorkOrderResponse::from)
                .orElseThrow(() -> new RuntimeException("Radni nalog nije pronađen!"));
    }

    @Transactional
    public WorkOrderResponse assignWorkOrder(Long workOrderId, Long operatorId) {
        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Radni nalog nije pronađen!"));

        User operator = userRepository.findById(operatorId)
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen!"));

        if (operator.getRole() != Role.OPERATOR) {
            throw new IllegalArgumentException("Korisnik mora imati ulogu OPERATOR da bi mu se dodelio nalog!");
        }

        if (order.getStatus() == WorkOrder.OrderStatus.COMPLETED ||
                order.getStatus() == WorkOrder.OrderStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Nije moguće dodeliti nalog sa statusom: " + order.getStatus().name().toLowerCase());
        }

        if (order.getAssignedTo() != null && order.getAssignedTo().getId().equals(operator.getId())) {
            throw new IllegalArgumentException("Nalog je već dodeljen ovom operateru!");
        }

        order.setAssignedTo(operator);
        return WorkOrderResponse.from(workOrderRepository.save(order));
    }

    @Transactional
    public WorkOrderResponse createWorkOrder(WorkOrderRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Proizvod nije pronađen!"));

        List<BOMItem> bomItems = bomItemRepository.findByProductId(product.getId());
        if (bomItems.isEmpty()) {
            throw new RuntimeException("Proizvod nema definisanu sastavnicu!");
        }

        for (BOMItem item : bomItems) {
            Double neededTotal = item.getQuantityRequired() * request.getQuantity();
            Double available = inventoryService.getStockForMaterial(item.getMaterial().getId());
            if (available < neededTotal) {
                throw new RuntimeException(
                        "Nedovoljno zaliha za materijal: " + item.getMaterial().getName() +
                                ". Potrebno: " + neededTotal + ", Dostupno: " + available);
            }
        }

        for (BOMItem item : bomItems) {
            Double neededTotal = item.getQuantityRequired() * request.getQuantity();
            inventoryService.reduceStock(item.getMaterial().getId(), neededTotal);
        }

        WorkOrder order = new WorkOrder();
        order.setProduct(product);
        order.setQuantity(request.getQuantity());
        order.setStatus(WorkOrder.OrderStatus.PLANNED);
        order.setCreatedAt(LocalDateTime.now());

        return WorkOrderResponse.from(workOrderRepository.save(order));
    }

    @Transactional
    public WorkOrderResponse advanceStatus(Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Radni nalog nije pronađen!"));

        switch (order.getStatus()) {
            case PLANNED     -> order.setStatus(WorkOrder.OrderStatus.IN_PROGRESS);
            case IN_PROGRESS -> order.setStatus(WorkOrder.OrderStatus.COMPLETED);
            default          -> throw new RuntimeException(
                    "Nije moguće napredovati nalog sa statusom: " + order.getStatus());
        }

        return WorkOrderResponse.from(workOrderRepository.save(order));
    }

    @Transactional
    public WorkOrderResponse cancelWorkOrder(Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Radni nalog nije pronađen!"));

        if (order.getStatus() == WorkOrder.OrderStatus.COMPLETED ||
                order.getStatus() == WorkOrder.OrderStatus.CANCELLED) {
            throw new RuntimeException(
                    "Nije moguće otkazati nalog sa statusom: " + order.getStatus());
        }

        List<BOMItem> bomItems = bomItemRepository.findByProductId(order.getProduct().getId());
        for (BOMItem item : bomItems) {
            Double returnAmount = item.getQuantityRequired() * order.getQuantity();
            inventoryService.addStock(item.getMaterial().getId(), returnAmount);
        }

        order.setStatus(WorkOrder.OrderStatus.CANCELLED);
        return WorkOrderResponse.from(workOrderRepository.save(order));
    }
}