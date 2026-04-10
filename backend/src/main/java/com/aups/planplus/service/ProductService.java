package com.aups.planplus.service;

import com.aups.planplus.model.Product;
import com.aups.planplus.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Govori Springu da je ovo klasa sa biznis logikom
@RequiredArgsConstructor // Lombok magija: automatski ubacuje ProductRepository (Dependency Injection)
public class ProductService {

    private final ProductRepository productRepository;

    // 1. Dohvati sve proizvode (READ)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 2. Kreiraj novi proizvod (CREATE) sa biznis logikom
    public Product createProduct(Product product) {
        // Biznis logika: Ako proizvod sa ovim SKU već postoji, ne dozvoli upis!
        Product existingProduct = productRepository.findBySku(product.getSku());
        if (existingProduct != null) {
            throw new RuntimeException("Proizvod sa šifrom " + product.getSku() + " već postoji!");
        }
        return productRepository.save(product);
    }
}