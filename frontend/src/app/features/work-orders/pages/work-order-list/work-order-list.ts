import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkOrder } from '../../../../core/models/work-order.model';
import { WorkOrderService } from '../../work-order';
import { ProductService } from '../../../products/product';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-work-order-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './work-order-list.html',
  styleUrl: './work-order-list.scss'
})
export class WorkOrderList implements OnInit {

  workOrders: WorkOrder[] = [];
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';

  orderForm: FormGroup;

  constructor(
    private workOrderService: WorkOrderService,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.orderForm = this.fb.group({
      productId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadWorkOrders();
    this.loadProducts();
  }

  loadWorkOrders(): void {
    this.isLoading = true;
    this.workOrderService.getAll().subscribe({
      next: (data) => {
        this.workOrders = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Greška pri učitavanju radnih naloga.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) return;

    this.workOrderService.create(this.orderForm.value).subscribe({
      next: () => {
        this.orderForm.reset();
        this.errorMessage = '';
        this.loadWorkOrders();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Greška pri kreiranju radnog naloga.';
      }
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PLANNED: 'Planiran',
      IN_PROGRESS: 'U toku',
      COMPLETED: 'Završen',
      CANCELLED: 'Otkazan'
    };
    return labels[status] ?? status;
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      PLANNED: 'status-planned',
      IN_PROGRESS: 'status-progress',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled'
    };
    return classes[status] ?? '';
  }
}