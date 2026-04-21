package com.aups.planplus.service;

import com.aups.planplus.model.Product;
import com.aups.planplus.model.WorkOrder;
import com.aups.planplus.repository.ProductRepository;
import com.aups.planplus.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    public final WorkOrderRepository workOrderRepository;

    public Page<Product> getAllProducts(String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return productRepository.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(search, search, pageable);
        }
        return productRepository.findAll(pageable);
    }

    public Product getById(Long id){
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Proizvod sa ID " + id + " nije pronađen!"));
    }

    public Product createProduct(Product product) {
        // Biznis logika: Ako proizvod sa ovim SKU već postoji, ne dozvoli upis!
        Product existingProduct = productRepository.findBySku(product.getSku());
        if (existingProduct != null) {
            throw new RuntimeException("Proizvod sa šifrom " + product.getSku() + " već postoji!");
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct){
        Product existing = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Proizvod sa ID: " + id + " nije pronađen!"));
        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Proizvod sa ID: " + id + " nije pronađen!"));

        boolean hasActiveOrders = workOrderRepository.existsByProductIdAndStatusIn(id, List.of(WorkOrder.OrderStatus.PLANNED, WorkOrder.OrderStatus.IN_PROGRESS));

        if(hasActiveOrders){
            throw new IllegalStateException("Proizvod ima aktivne radne naloge!");
        }

        productRepository.deleteById(id);
    }
}