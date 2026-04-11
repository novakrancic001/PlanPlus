import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Material } from '../../../../core/models/material.model';
import { MaterialService } from '../../material';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Unit } from '../../../../core/models/product.model';

@Component({
  selector: 'app-material-list',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './material-list.html',
  styleUrl: './material-list.scss'
})
export class MaterialListComponent implements OnInit {

  materials: Material[] = [];
  isLoading = false;
  errorMessage = '';

  // Create forma
  materialForm: FormGroup;

  // Inline edit
  editingId: number | null = null;
  editName: string = '';
  editUnit: Unit = 'PCS';

  // Delete dialog
  showDeleteDialog = false;
  materialToDelete: Material | null = null;

  constructor(
    private materialService: MaterialService,
    private fb: FormBuilder
  ) {
    this.materialForm = this.fb.group({
      sku: ['', Validators.required],
      name: ['', Validators.required],
      unit: ['PCS', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.isLoading = true;
    this.materialService.getAll().subscribe({
      next: (data: Material[]) => {
        this.materials = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Greška pri učitavanju materijala.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.materialForm.invalid) return;
    this.materialService.create(this.materialForm.value).subscribe({
      next: () => {
        this.materialForm.reset({ unit: 'PCS' });
        this.loadMaterials();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Greška pri kreiranju materijala.';
      }
    });
  }

  // --- Edit ---
  startEdit(material: Material): void {
    this.editingId = material.id;
    this.editName = material.name;
    this.editUnit = material.unit;
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(material: Material): void {
    const updated: Material = { ...material, name: this.editName, unit: this.editUnit };
    this.materialService.updateMaterial(material.id, updated).subscribe({
      next: () => {
        this.loadMaterials();
        this.editingId = null;
      },
      error: (err: any) => {
        this.errorMessage = 'Greška pri izmeni materijala.';
        console.error(err);
      }
    });
  }

  // --- Delete ---
  openDeleteDialog(material: Material): void {
    this.materialToDelete = material;
    this.errorMessage = '';
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.materialToDelete = null;
  }

  confirmDelete(): void {
    if (!this.materialToDelete) return;
    this.materialService.deleteMaterial(this.materialToDelete.id).subscribe({
      next: () => {
        this.loadMaterials();
        this.cancelDelete();
      },
      error: (err: any) => {
        this.cancelDelete();
        if (err.status === 409) {
          this.errorMessage = 'Materijal se koristi u BOM stavkama i ne može biti obrisan.';
        } else {
          this.errorMessage = 'Greška pri brisanju materijala.';
        }
      }
    });
  }
}