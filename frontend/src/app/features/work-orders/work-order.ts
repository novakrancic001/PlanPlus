import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkOrder } from '../../core/models/work-order.model';
import { Page, PageRequest } from '../../core/models/page.model';

export interface WorkOrderRequest {
  productId: number;
  quantity: number;
}

export interface WorkOrderPageRequest extends PageRequest {
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkOrderService {

  private readonly apiUrl = 'http://localhost:8080/api/work-orders';

  constructor(private http: HttpClient) {}

  getAll(req: WorkOrderPageRequest = { page: 0, size: 20 }): Observable<Page<WorkOrder>> {
    let params = new HttpParams()
      .set('page', req.page)
      .set('size', req.size);
    if (req.sort)   params = params.set('sort', req.sort);
    if (req.search) params = params.set('search', req.search);
    if (req.status) params = params.set('status', req.status);
    return this.http.get<Page<WorkOrder>>(this.apiUrl, { params });
  }

  create(request: WorkOrderRequest): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(this.apiUrl, request);
  }

  advance(id: number): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.apiUrl}/${id}/advance`, {});
  }

  cancel(id: number): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.apiUrl}/${id}/cancel`, {});
  }

  assign(orderId: number, operatorId: number): Observable<WorkOrder> {
    return this.http.put<WorkOrder>(`${this.apiUrl}/${orderId}/assign`, { operatorId });
  }
}
