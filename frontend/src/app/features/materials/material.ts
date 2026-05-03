import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Material } from '../../core/models/material.model';
import { Page, PageRequest } from '../../core/models/page.model';

@Injectable({ providedIn: 'root' })
export class MaterialService {

  private readonly apiUrl = 'http://localhost:8080/api/materials';

  constructor(private http: HttpClient) {}

  getAll(req: PageRequest = { page: 0, size: 20 }): Observable<Page<Material>> {
    let params = new HttpParams()
      .set('page', req.page)
      .set('size', req.size);
    if (req.sort)   params = params.set('sort', req.sort);
    if (req.search) params = params.set('search', req.search);
    return this.http.get<Page<Material>>(this.apiUrl, { params });
  }

  getAllForDropdown(): Observable<Material[]> {
    return this.getAll({ page: 0, size: 1000 }).pipe(map(p => p.content));
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
