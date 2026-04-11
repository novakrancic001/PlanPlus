import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../product';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  isLoading = false;
  errorMessage = '';

  // Create forma
  productForm: FormGroup;

  // Inline edit
  editingId: number | null = null;
  editName: string = '';
  editDescription: string = '';

  // Delete dialog
  showDeleteDialog = false;
  productToDelete: Product | null = null;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      sku: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      unit: ['PCS', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAll().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Greška pri učitavanju proizvoda.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    this.productService.create(this.productForm.value).subscribe({
      next: () => {
        this.productForm.reset({ unit: 'PCS' });
        this.loadProducts();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Greška pri kreiranju proizvoda.';
      }
    });
  }

  // --- Edit ---
  startEdit(product: Product): void {
    this.editingId = product.id;
    this.editName = product.name;
    this.editDescription = product.description ?? '';
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(product: Product): void {
    const updated: Product = { ...product, name: this.editName, description: this.editDescription };
    this.productService.updateProduct(product.id, updated).subscribe({
      next: () => {
        this.loadProducts();
        this.editingId = null;
      },
      error: (err: any) => {
        this.errorMessage = 'Greška pri izmeni proizvoda.';
        console.error(err);
      }
    });
  }

  // --- Delete ---
  openDeleteDialog(product: Product): void {
    this.productToDelete = product;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.productToDelete = null;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;
    const productName = this.productToDelete.name;
    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        this.loadProducts();
        this.cancelDelete();
      },
      error: (err: any) => {
        this.cancelDelete();
        if (err.status === 409) {
          const reason = err.error?.reason;
          if (reason === 'ACTIVE_WORK_ORDERS') {
            this.errorMessage = `Proizvod "${productName}" ima aktivne ili planirane radne naloge i ne može biti obrisan.`;
          } else {
            this.errorMessage = `Proizvod "${productName}" ne može biti obrisan zbog povezanih podataka.`;
          }
        } else {
          this.errorMessage = 'Greška pri brisanju proizvoda.';
        }
      }
    });
  }
}