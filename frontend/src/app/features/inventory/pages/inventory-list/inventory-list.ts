import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Inventory } from '../../../../core/models/inventory.model';
import { InventoryService } from '../../inventory';
import { MaterialService } from '../../../materials/material';
import { Material } from '../../../../core/models/material.model';

@Component({
  selector: 'app-inventory-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.scss'
})
export class InventoryList implements OnInit {

  inventory: Inventory[] = [];
  materials: Material[] = [];
  isLoading = false;
  errorMessage = '';

  stockForm: FormGroup;

  constructor(
    private inventoryService: InventoryService,
    private materialService: MaterialService,
    private fb: FormBuilder
  ) {
    this.stockForm = this.fb.group({
      materialId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadInventory();
    this.loadMaterials();
  }

  loadInventory(): void {
    this.isLoading = true;
    this.inventoryService.getAll().subscribe({
      next: (data) => {
        this.inventory = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Greška pri učitavanju zaliha.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadMaterials(): void {
    this.materialService.getAll().subscribe({
      next: (data) => this.materials = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit(): void {
    if (this.stockForm.invalid) return;

    const { materialId, quantity } = this.stockForm.value;

    this.inventoryService.addStock(materialId, quantity).subscribe({
      next: () => {
        this.stockForm.reset();
        this.errorMessage = '';
        this.loadInventory();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Greška pri dodavanju zaliha.';
      }
    });
  }
}