import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../../core/models/product.model';
import { Page, PageRequest } from '../../core/models/page.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private readonly apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  getAll(req: PageRequest = { page: 0, size: 20 }): Observable<Page<Product>> {
    let params = new HttpParams()
      .set('page', req.page)
      .set('size', req.size);
    if (req.sort)   params = params.set('sort', req.sort);
    if (req.search) params = params.set('search', req.search);
    return this.http.get<Page<Product>>(this.apiUrl, { params });
  }

  getAllForDropdown(): Observable<Product[]> {
    return this.getAll({ page: 0, size: 1000 }).pipe(map(p => p.content));
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
