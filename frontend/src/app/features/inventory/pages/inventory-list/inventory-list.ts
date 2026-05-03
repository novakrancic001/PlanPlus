import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Inventory } from '../../../../core/models/inventory.model';
import { InventoryService } from '../../inventory';
import { MaterialService } from '../../../materials/material';
import { Material } from '../../../../core/models/material.model';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-inventory-list',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaginatorComponent],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.scss'
})
export class InventoryList implements OnInit {

  inventory: Inventory[] = [];
  materials: Material[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  searchQuery = '';
  sortField: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';

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
    this.load();
    this.loadMaterialsForDropdown();
  }

  load(): void {
    this.isLoading = true;
    this.inventoryService.getAll({
      page: this.currentPage,
      size: this.pageSize,
      sort: this.sortField ? `${this.sortField},${this.sortDir}` : undefined,
      search: this.searchQuery || undefined
    }).subscribe({
      next: page => {
        this.inventory     = page.content;
        this.totalElements = page.totalElements;
        this.totalPages    = page.totalPages;
        this.isLoading     = false;
      },
      error: () => {
        this.errorMessage = 'Greška pri učitavanju zaliha.';
        this.isLoading    = false;
      }
    });
  }

  loadMaterialsForDropdown(): void {
    this.materialService.getAllForDropdown().subscribe({
      next: data => this.materials = data,
      error: err => console.error(err)
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.load();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.load();
  }

  onSizeChange(size: number): void {
    this.pageSize    = size;
    this.currentPage = 0;
    this.load();
  }

  setSort(field: string): void {
    if (this.sortField === field) {
      this.sortDir === 'asc' ? (this.sortDir = 'desc') : (this.sortField = null);
    } else {
      this.sortField = field;
      this.sortDir   = 'asc';
    }
    this.currentPage = 0;
    this.load();
  }

  sortIcon(field: string): string {
    if (this.sortField !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  onSubmit(): void {
    if (this.stockForm.invalid) return;
    const { materialId, quantity } = this.stockForm.value;
    this.inventoryService.addStock(materialId, quantity).subscribe({
      next: () => {
        this.stockForm.reset();
        this.errorMessage = '';
        this.currentPage  = 0;
        this.load();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Greška pri dodavanju zaliha.';
      }
    });
  }
}
