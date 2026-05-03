import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../product';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, ConfirmDialogComponent, PaginatorComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  searchQuery = '';
  sortField: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';

  productForm: FormGroup;

  editingId: number | null = null;
  editName = '';
  editDescription = '';

  showDeleteDialog = false;
  productToDelete: Product | null = null;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      sku:         ['', Validators.required],
      name:        ['', Validators.required],
      description: [''],
      unit:        ['PCS', Validators.required]
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.productService.getAll({
      page: this.currentPage,
      size: this.pageSize,
      sort: this.sortField ? `${this.sortField},${this.sortDir}` : undefined,
      search: this.searchQuery || undefined
    }).subscribe({
      next: page => {
        this.products      = page.content;
        this.totalElements = page.totalElements;
        this.totalPages    = page.totalPages;
        this.isLoading     = false;
      },
      error: () => {
        this.errorMessage = 'Greška pri učitavanju proizvoda.';
        this.isLoading    = false;
      }
    });
  }

  onSearch(): void { this.currentPage = 0; this.load(); }

  onPageChange(page: number): void { this.currentPage = page; this.load(); }

  onSizeChange(size: number): void { this.pageSize = size; this.currentPage = 0; this.load(); }

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
    if (this.productForm.invalid) return;
    this.errorMessage = '';
    this.productService.create(this.productForm.value).subscribe({
      next: () => {
        this.productForm.reset({ unit: 'PCS' });
        this.currentPage = 0;
        this.load();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Greška pri kreiranju proizvoda.';
      }
    });
  }

  startEdit(product: Product): void {
    this.editingId      = product.id;
    this.editName       = product.name;
    this.editDescription = product.description ?? '';
  }

  cancelEdit(): void { this.editingId = null; }

  saveEdit(product: Product): void {
    const updated: Product = { ...product, name: this.editName, description: this.editDescription };
    this.productService.updateProduct(product.id, updated).subscribe({
      next: () => { this.editingId = null; this.load(); },
      error: () => { this.errorMessage = 'Greška pri izmeni proizvoda.'; }
    });
  }

  openDeleteDialog(product: Product): void {
    this.productToDelete  = product;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.productToDelete  = null;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;
    const name = this.productToDelete.name;
    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => { this.cancelDelete(); this.load(); },
      error: (err: any) => {
        this.cancelDelete();
        if (err.status === 409) {
          this.errorMessage = err.error?.reason === 'ACTIVE_WORK_ORDERS'
            ? `Proizvod "${name}" ima aktivne radne naloge i ne može biti obrisan.`
            : `Proizvod "${name}" ne može biti obrisan zbog povezanih podataka.`;
        } else {
          this.errorMessage = 'Greška pri brisanju proizvoda.';
        }
      }
    });
  }
}
