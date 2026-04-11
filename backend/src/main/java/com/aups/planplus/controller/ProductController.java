package com.aups.planplus.controller;

import com.aups.planplus.model.Product;
import com.aups.planplus.repository.ProductRepository;
import com.aups.planplus.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController // Govori Springu da ova klasa vraća JSON podatke (ne HTML stranice)
@RequestMapping("/api/products") // Osnovni URL za sve metode ispod
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;

    // GET zahtev na http://localhost:8080/api/products
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id){
        return productService.getById(id);
    }

    // POST zahtev na http://localhost:8080/api/products
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        // @RequestBody kaže Springu: "Pretvori onaj JSON što je poslao React/Angular u Java Product objekat"
        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product){
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("reason", "ACTIVE_WORK_ORDERS"));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("reason", "DATA_INTEGRITY"));
        }
    }
}