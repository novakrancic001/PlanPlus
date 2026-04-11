import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../../../core/models/product.model';
import { BOMItem } from '../../../../core/models/bom-item.model';
import { Material } from '../../../../core/models/material.model';
import { ProductService } from '../../product';
import { BomItemService } from '../../../bom/bom-item';
import { MaterialService } from '../../../materials/material';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetailComponent implements OnInit {

  product: Product | null = null;
  bomItems: BOMItem[] = [];
  materials: Material[] = [];
  isLoading = false;
  errorMessage = '';

  bomForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private bomItemService: BomItemService,
    private materialService: MaterialService,
    private fb: FormBuilder
  ) {
    this.bomForm = this.fb.group({
      materialId: [null, Validators.required],
      quantityRequired: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct(id);
    this.loadBom(id);
    this.loadMaterials();
  }

  loadProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (data) => this.product = data,
      error: () => this.errorMessage = 'Greška pri učitavanju proizvoda.'
    });
  }

  loadBom(id: number): void {
    this.isLoading = true;
    this.bomItemService.getForProduct(id).subscribe({
      next: (data) => {
        this.bomItems = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Greška pri učitavanju sastavnice.';
        this.isLoading = false;
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
    if (this.bomForm.invalid || !this.product) return;

    const request = {
      productId: this.product.id,
      materialId: this.bomForm.value.materialId,
      quantityRequired: this.bomForm.value.quantityRequired
    };

    this.bomItemService.create(request).subscribe({
      next: () => {
        this.bomForm.reset();
        this.errorMessage = '';
        this.loadBom(this.product!.id);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Greška pri dodavanju materijala.';
      }
    });
  }
}