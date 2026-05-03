import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkloadService } from '../../workload.service';
import { OperatorWorkload } from '../../../../core/models/workload.model';

@Component({
  selector: 'app-workload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workload.html',
  styleUrl: './workload.scss'
})
export class WorkloadComponent implements OnInit {
  private readonly workloadService = inject(WorkloadService);

  operators: OperatorWorkload[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.isLoading = true;
    this.workloadService.getAll().subscribe({
      next: data => {
        this.operators = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Greška pri učitavanju operatera.';
        this.isLoading = false;
      }
    });
  }

  statusLabel(op: OperatorWorkload): string {
    const labels: Record<string, string> = {
      GREEN: 'Slobodan',
      ORANGE: 'Umereno',
      RED: 'Preopterećen'
    };
    return labels[op.loadStatus] ?? op.loadStatus;
  }
}
