import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventory } from '../../core/models/inventory.model';
import { Page, PageRequest } from '../../core/models/page.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {

  private readonly apiUrl = 'http://localhost:8080/api/inventory';

  constructor(private http: HttpClient) {}

  getAll(req: PageRequest = { page: 0, size: 20 }): Observable<Page<Inventory>> {
    let params = new HttpParams()
      .set('page', req.page)
      .set('size', req.size);
    if (req.sort)   params = params.set('sort', req.sort);
    if (req.search) params = params.set('search', req.search);
    return this.http.get<Page<Inventory>>(this.apiUrl, { params });
  }

  addStock(materialId: number, quantity: number): Observable<Inventory> {
    const params = new HttpParams()
      .set('materialId', materialId)
      .set('quantity', quantity);
    return this.http.post<Inventory>(`${this.apiUrl}/add`, null, { params });
  }
}
