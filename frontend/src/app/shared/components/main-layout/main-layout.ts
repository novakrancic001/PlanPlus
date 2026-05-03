import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent {
  protected readonly auth = inject(AuthService);

  roleLabel(): string {
    const labels: Record<string, string> = { ADMIN: 'Admin', PLANNER: 'Planer', OPERATOR: 'Operater' };
    return labels[this.auth.userRole() ?? ''] ?? '';
  }

  logout(): void {
    this.auth.logout();
  }
}
