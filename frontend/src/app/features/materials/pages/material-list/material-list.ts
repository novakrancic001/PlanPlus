import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Material } from '../../../../core/models/material.model';
import { MaterialService } from '../../material';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator';
import { Unit } from '../../../../core/models/product.model';

@Component({
  selector: 'app-material-list',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmDialogComponent, PaginatorComponent],
  templateUrl: './material-list.html',
  styleUrl: './material-list.scss'
})
export class MaterialListComponent implements OnInit {

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

  materialForm: FormGroup;

  editingId: number | null = null;
  editName = '';
  editUnit: Unit = 'PCS';

  showDeleteDialog = false;
  materialToDelete: Material | null = null;

  constructor(
    private materialService: MaterialService,
    private fb: FormBuilder
  ) {
    this.materialForm = this.fb.group({
      sku:  ['', Validators.required],
      name: ['', Validators.required],
      unit: ['PCS', Validators.required]
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.materialService.getAll({
      page: this.currentPage,
      size: this.pageSize,
      sort: this.sortField ? `${this.sortField},${this.sortDir}` : undefined,
      search: this.searchQuery || undefined
    }).subscribe({
      next: page => {
        this.materials     = page.content;
        this.totalElements = page.totalElements;
        this.totalPages    = page.totalPages;
        this.isLoading     = false;
      },
      error: () => {
        this.errorMessage = 'Greška pri učitavanju materijala.';
        this.isLoading    = false;
      }
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
    if (this.materialForm.invalid) return;
    this.errorMessage = '';
    this.materialService.create(this.materialForm.value).subscribe({
      next: () => {
        this.materialForm.reset({ unit: 'PCS' });
        this.currentPage = 0;
        this.load();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Greška pri kreiranju materijala.';
      }
    });
  }

  startEdit(material: Material): void {
    this.editingId = material.id;
    this.editName  = material.name;
    this.editUnit  = material.unit;
  }

  cancelEdit(): void { this.editingId = null; }

  saveEdit(material: Material): void {
    const updated: Material = { ...material, name: this.editName, unit: this.editUnit };
    this.materialService.updateMaterial(material.id, updated).subscribe({
      next: () => { this.editingId = null; this.load(); },
      error: () => { this.errorMessage = 'Greška pri izmeni materijala.'; }
    });
  }

  openDeleteDialog(material: Material): void {
    this.materialToDelete = material;
    this.errorMessage     = '';
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.materialToDelete = null;
  }

  confirmDelete(): void {
    if (!this.materialToDelete) return;
    this.materialService.deleteMaterial(this.materialToDelete.id).subscribe({
      next: () => { this.cancelDelete(); this.load(); },
      error: (err: any) => {
        this.cancelDelete();
        this.errorMessage = err.status === 409
          ? 'Materijal se koristi u BOM stavkama i ne može biti obrisan.'
          : 'Greška pri brisanju materijala.';
      }
    });
  }
}
