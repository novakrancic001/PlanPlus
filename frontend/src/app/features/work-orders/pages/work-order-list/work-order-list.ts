import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkOrder, OrderStatus } from '../../../../core/models/work-order.model';
import { WorkOrderService } from '../../work-order';
import { ProductService } from '../../../products/product';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-work-order-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './work-order-list.html',
  styleUrl: './work-order-list.scss',
})
export class WorkOrderList implements OnInit {
  workOrders: WorkOrder[] = [];
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  orderForm: FormGroup;

  readonly statusLabels: Record<OrderStatus, string> = {
    PLANNED: 'Planiran',
    IN_PROGRESS: 'U toku',
    COMPLETED: 'Završen',
    CANCELLED: 'Otkazan',
  };

  readonly advanceLabels: Partial<Record<OrderStatus, string>> = {
    PLANNED: 'Pokreni',
    IN_PROGRESS: 'Završi',
  };

  constructor(
    private workOrderService: WorkOrderService,
    private productService: ProductService,
    private fb: FormBuilder,
  ) {
    this.orderForm = this.fb.group({
      productId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
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
      },
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => (this.products = data),
      error: (err) => console.error(err),
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) return;
    this.errorMessage = '';
    this.successMessage = '';

    this.workOrderService.create(this.orderForm.value).subscribe({
      next: () => {
        this.orderForm.reset();
        this.successMessage = 'Radni nalog je uspešno kreiran.';
        this.loadWorkOrders();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Greška pri kreiranju radnog naloga.';
      },
    });
  }

  advanceOrder(id: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.workOrderService.advance(id).subscribe({
      next: () => {
        this.successMessage = 'Status naloga je ažuriran.';
        this.loadWorkOrders();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Greška pri ažuriranju statusa.';
      },
    });
  }

  cancelOrder(id: number): void {
    if (!confirm('Otkazati ovaj radni nalog? Materijali će biti vraćeni na zalihe.')) return;
    this.errorMessage = '';
    this.successMessage = '';

    this.workOrderService.cancel(id).subscribe({
      next: () => {
        this.successMessage = 'Radni nalog je otkazan.';
        this.loadWorkOrders();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Greška pri otkazivanju naloga.';
      },
    });
  }

  canAdvance(order: WorkOrder): boolean {
    return order.status === 'PLANNED' || order.status === 'IN_PROGRESS';
  }

  canCancel(order: WorkOrder): boolean {
    return order.status === 'PLANNED' || order.status === 'IN_PROGRESS';
  }
}