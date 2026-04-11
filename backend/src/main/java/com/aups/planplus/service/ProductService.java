package com.aups.planplus.service;

import com.aups.planplus.model.Product;
import com.aups.planplus.model.WorkOrder;
import com.aups.planplus.repository.ProductRepository;
import com.aups.planplus.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Govori Springu da je ovo klasa sa biznis logikom
@RequiredArgsConstructor // Automatski ubacuje ProductRepository (Dependency Injection)
public class ProductService {

    private final ProductRepository productRepository;
    public final WorkOrderRepository workOrderRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
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