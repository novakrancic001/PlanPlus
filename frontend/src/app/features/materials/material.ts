import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../../core/models/material.model';

@Injectable({ providedIn: 'root' })
export class MaterialService {

  private apiUrl = 'http://localhost:8080/api/materials';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }

  create(material: Omit<Material, 'id'>): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, material);
  }

  updateMaterial(id: number, material: Material): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/${id}`, material);
  }

  deleteMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}