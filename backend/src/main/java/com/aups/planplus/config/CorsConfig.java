package com.aups.planplus.config;

import lombok.NonNull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/api/**") // Primenjuje se na apsolutno sve rute
                        .allowedOrigins("http://localhost:4200") // Tvoj Angular port
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Dozvoljeni HTTP metodi
                        .allowedHeaders("*") // Dozvoli sva zaglavlja (bitno za autentifikaciju kasnije)
                        .allowCredentials(true); // Bitno ako budeš slao kolačiće/sessije
            }
        };
    }
}