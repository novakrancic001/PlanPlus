import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { WorkOrder, OrderStatus } from '../../../../core/models/work-order.model';
import { WorkOrderService } from '../../work-order';
import { WorkloadService } from '../../workload.service';
import { ProductService } from '../../../products/product';
import { Product } from '../../../../core/models/product.model';
import { OperatorWorkload } from '../../../../core/models/workload.model';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-work-order-list',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaginatorComponent],
  templateUrl: './work-order-list.html',
  styleUrl: './work-order-list.scss',
})
export class WorkOrderList implements OnInit {

  workOrders: WorkOrder[] = [];
  products: Product[] = [];
  operators: OperatorWorkload[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  searchQuery = '';
  statusFilter = '';
  sortField: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';

  // Assign state
  assigningOrderId: number | null = null;
  selectedOperatorId: number | null = null;

  orderForm: FormGroup;

  readonly statusLabels: Record<OrderStatus, string> = {
    PLANNED: 'Planiran',
    IN_PROGRESS: 'U toku',
    COMPLETED: 'Završen',
    CANCELLED: 'Otkazan',
  };

  readonly loadStatusLabels: Record<string, string> = {
    GREEN: 'zelena',
    ORANGE: 'narandžasta',
    RED: 'crvena'
  };

  constructor(
    private workOrderService: WorkOrderService,
    private workloadService: WorkloadService,
    private productService: ProductService,
    private fb: FormBuilder,
    public auth: AuthService
  ) {
    this.orderForm = this.fb.group({
      productId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    this.load();
    if (this.auth.userRole() === 'PLANNER') {
      this.loadProductsForDropdown();
      this.loadOperators();
    }
  }

  load(): void {
    this.isLoading = true;
    this.workOrderService.getAll({
      page: this.currentPage,
      size: this.pageSize,
      sort: this.sortField ? `${this.sortField},${this.sortDir}` : undefined,
      search: this.searchQuery || undefined,
      status: this.statusFilter || undefined
    }).subscribe({
      next: page => {
        this.workOrders    = page.content;
        this.totalElements = page.totalElements;
        this.totalPages    = page.totalPages;
        this.isLoading     = false;
      },
      error: (err: any) => {
        this.errorMessage = this.extractError(err, 'Greška pri učitavanju radnih naloga.');
        this.isLoading    = false;
      }
    });
  }

  loadProductsForDropdown(): void {
    this.productService.getAllForDropdown().subscribe({
      next: data => this.products = data,
      error: err => console.error(err)
    });
  }

  loadOperators(): void {
    this.workloadService.getAll().subscribe({
      next: data => this.operators = data,
      error: err => console.error(err)
    });
  }

  onSearch(): void { this.currentPage = 0; this.load(); }

  onStatusFilterChange(): void { this.currentPage = 0; this.load(); }

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
    if (this.orderForm.invalid) return;
    this.errorMessage  = '';
    this.successMessage = '';
    this.workOrderService.create(this.orderForm.value).subscribe({
      next: () => {
        this.orderForm.reset();
        this.successMessage = 'Radni nalog je uspešno kreiran.';
        this.currentPage    = 0;
        this.load();
      },
      error: (err: any) => {
        this.errorMessage = this.extractError(err, 'Greška pri kreiranju radnog naloga.');
      },
    });
  }

  advanceOrder(id: number): void {
    this.errorMessage  = '';
    this.successMessage = '';
    this.workOrderService.advance(id).subscribe({
      next: () => { this.successMessage = 'Status naloga je ažuriran.'; this.load(); },
      error: (err: any) => {
        this.errorMessage = this.extractError(err, 'Greška pri ažuriranju statusa.');
      }
    });
  }

  cancelOrder(id: number): void {
    if (!confirm('Otkazati ovaj radni nalog? Materijali će biti vraćeni na zalihe.')) return;
    this.errorMessage  = '';
    this.successMessage = '';
    this.workOrderService.cancel(id).subscribe({
      next: () => { this.successMessage = 'Radni nalog je otkazan.'; this.load(); },
      error: (err: any) => {
        this.errorMessage = this.extractError(err, 'Greška pri otkazivanju naloga.');
      }
    });
  }

  // --- Assign ---
  openAssign(orderId: number): void {
    this.assigningOrderId    = orderId;
    this.selectedOperatorId  = null;
    this.errorMessage        = '';
  }

  cancelAssign(): void {
    this.assigningOrderId   = null;
    this.selectedOperatorId = null;
  }

  submitAssign(orderId: number): void {
    if (!this.selectedOperatorId) return;
    this.workOrderService.assign(orderId, this.selectedOperatorId).subscribe({
      next: () => {
        this.successMessage = 'Operater je dodeljen radnom nalogu.';
        this.cancelAssign();
        this.load();
      },
      error: (err: any) => {
        this.errorMessage = this.extractError(err, 'Greška pri dodeli operatera.');
        this.cancelAssign();
      }
    });
  }

  canAdvance(order: WorkOrder): boolean {
    const role = this.auth.userRole();
    if (role === 'PLANNER') {
      return order.status === 'PLANNED' || order.status === 'IN_PROGRESS';
    }
    if (role === 'OPERATOR') {
      const userId = this.auth.currentUser()?.id;
      return order.status === 'IN_PROGRESS' && order.assignedTo?.id === userId;
    }
    return false;
  }

  advanceLabel(order: WorkOrder): string {
    if (this.auth.userRole() === 'PLANNER') {
      return order.status === 'PLANNED' ? 'Pokreni' : 'Završi';
    }
    return 'Završi';
  }

  canCancel(order: WorkOrder): boolean {
    return this.auth.userRole() === 'PLANNER' &&
      (order.status === 'PLANNED' || order.status === 'IN_PROGRESS');
  }

  canAssign(order: WorkOrder): boolean {
    return order.status === 'PLANNED' || order.status === 'IN_PROGRESS';
  }

  private extractError(err: any, fallback: string): string {
    if (err.status === 403) return 'Nemate dozvolu za ovu akciju.';
    return err.error?.error || err.error?.message || fallback;
  }
}
