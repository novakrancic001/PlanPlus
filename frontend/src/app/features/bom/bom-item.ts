import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BOMItem } from '../../core/models/bom-item.model';

export interface BOMItemRequest {
  productId: number;
  materialId: number;
  quantityRequired: number;
}

@Injectable({ providedIn: 'root' })
export class BomItemService {

  private apiUrl = 'http://localhost:8080/api/bom';

  constructor(private http: HttpClient) { }

  getForProduct(productId: number): Observable<BOMItem[]> {
    return this.http.get<BOMItem[]>(`${this.apiUrl}/product/${productId}`);
  }

  create(request: BOMItemRequest): Observable<BOMItem> {
    return this.http.post<BOMItem>(this.apiUrl, request);
  }
}