import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkOrder } from '../../core/models/work-order.model';

export interface WorkOrderRequest {
  productId: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class WorkOrderService {

  private apiUrl = 'http://localhost:8080/api/work-orders';

  constructor(private http: HttpClient) { }

  getAll(): Observable<WorkOrder[]> {
    return this.http.get<WorkOrder[]>(this.apiUrl);
  }

  create(request: WorkOrderRequest): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(this.apiUrl, request);
  }
}