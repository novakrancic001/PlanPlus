import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OperatorWorkload } from '../../core/models/workload.model';

@Injectable({ providedIn: 'root' })
export class WorkloadService {

  private readonly apiUrl = 'http://localhost:8080/api/operators/workload';

  constructor(private http: HttpClient) {}

  getAll(): Observable<OperatorWorkload[]> {
    return this.http.get<OperatorWorkload[]>(this.apiUrl);
  }
}
