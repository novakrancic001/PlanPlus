import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../product';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  isLoading = false;
  errorMessage = '';

  productForm: FormGroup;

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
      next: (data: any) => {
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
}