package com.aups.planplus.controller;

import com.aups.planplus.model.Product;
import com.aups.planplus.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Govori Springu da ova klasa vraća JSON podatke (ne HTML stranice)
@RequestMapping("/api/products") // Osnovni URL za sve metode ispod
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // GET zahtev na http://localhost:8080/api/products
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // POST zahtev na http://localhost:8080/api/products
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        // @RequestBody kaže Springu: "Pretvori onaj JSON što je poslao React/Angular u Java Product objekat"
        return productService.createProduct(product);
    }
}