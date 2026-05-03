import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss'
})
export class PaginatorComponent {
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Input() size = 20;

  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  readonly pageSizes = [10, 20, 50, 100];

  get from(): number {
    return this.totalElements === 0 ? 0 : this.page * this.size + 1;
  }

  get to(): number {
    return Math.min((this.page + 1) * this.size, this.totalElements);
  }

  get pageNumbers(): number[] {
    const delta = 2;
    const start = Math.max(0, this.page - delta);
    const end = Math.min(this.totalPages - 1, this.page + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goTo(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      this.pageChange.emit(p);
    }
  }

  onSizeChange(event: Event): void {
    const val = +(event.target as HTMLSelectElement).value;
    this.sizeChange.emit(val);
  }
}
