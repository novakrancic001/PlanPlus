import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Material } from '../../../../core/models/material.model';
import { MaterialService } from '../../material';

@Component({
  selector: 'app-material-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './material-list.html',
  styleUrl: './material-list.scss'
})
export class MaterialListComponent implements OnInit {

  materials: Material[] = [];
  isLoading = false;
  errorMessage = '';

  materialForm: FormGroup;

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
      next: (data: any) => {
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
}