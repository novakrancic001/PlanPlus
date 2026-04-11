import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventory } from '../../core/models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {

  private apiUrl = 'http://localhost:8080/api/inventory';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.apiUrl);
  }

  addStock(materialId: number, quantity: number): Observable<Inventory> {
    // Tvoj backend prima @RequestParam, ne @RequestBody
    // zato koristimo HttpParams (query parametri u URL-u: ?materialId=1&quantity=50)
    const params = new HttpParams()
      .set('materialId', materialId)
      .set('quantity', quantity);

    return this.http.post<Inventory>(`${this.apiUrl}/add`, null, { params });
  }
}