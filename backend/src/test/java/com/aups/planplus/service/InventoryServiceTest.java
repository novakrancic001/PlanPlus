package com.aups.planplus.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.aups.planplus.model.Inventory;
import com.aups.planplus.model.Material;
import com.aups.planplus.repository.InventoryRepository;
import com.aups.planplus.repository.MaterialRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private MaterialRepository materialRepository;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    @DisplayName("addStock - Kada materijal nema zalihe, kreira novi Inventory i čuva")
    void addStock_KadaMagacinNemaMaterijal_KreiraNoviUnos() {
        // GIVEN
        Long materialId = 1L;
        Material mockMaterial = new Material();
        mockMaterial.setId(materialId);
        mockMaterial.setName("Čelik");

        // Simuliramo da materijal postoji u bazi
        when(materialRepository.findById(materialId)).thenReturn(Optional.of(mockMaterial));
        // Simuliramo da inventar za taj materijal još ne postoji
        when(inventoryRepository.findByMaterialId(materialId)).thenReturn(Optional.empty());

        // Simuliramo proces čuvanja (vraćamo objekat koji nam proslede)
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        Inventory rezultat = inventoryService.addStock(materialId, 50.0);

        // THEN
        assertThat(rezultat).isNotNull();
        assertThat(rezultat.getMaterial()).isEqualTo(mockMaterial);
        assertThat(rezultat.getCurrentStock()).isEqualTo(50.0);

        verify(inventoryRepository, times(1)).save(any(Inventory.class));
    }

    @Test
    @DisplayName("reduceStock - Kada ima dovoljno zaliha, uspešno umanjuje stanje")
    void reduceStock_ImaDovoljnoZaliha_SmanjujeStanje() {
        // GIVEN
        Long materialId = 1L;
        Inventory mockInventory = new Inventory();
        mockInventory.setId(100L);
        mockInventory.setCurrentStock(100.0);

        when(inventoryRepository.findByMaterialId(materialId)).thenReturn(Optional.of(mockInventory));

        // WHEN
        inventoryService.reduceStock(materialId, 40.0);

        // THEN
        // Pošto funkcija vraća void, proveravamo stanje samog objekta koji je mutiran
        assertThat(mockInventory.getCurrentStock()).isEqualTo(60.0);
        verify(inventoryRepository, times(1)).save(mockInventory);
    }

    @Test
    @DisplayName("reduceStock - Kada nema dovoljno zaliha, baca izuzetak i ne čuva promene")
    void reduceStock_KadaNemaDovoljnoZaliha_BacaIzuzetak() {
        // GIVEN
        Long materialId = 1L;
        Inventory mockInventory = new Inventory();
        mockInventory.setCurrentStock(20.0); // Imamo samo 20 na stanju

        when(inventoryRepository.findByMaterialId(materialId)).thenReturn(Optional.of(mockInventory));

        // WHEN & THEN
        assertThatThrownBy(() -> inventoryService.reduceStock(materialId, 50.0)) // Pokušavamo da skinemo 50
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Nedovoljno stanje na zalihama!");

        // KLJUČNO: Proveravamo da se metoda save NIKADA nije pozvala
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }
}