import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly roles: Role[] = ['PLANNER', 'OPERATOR'];

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['' as Role, Validators.required]
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string>>({});

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.fieldErrors.set({});

    const value = this.form.value;

    this.auth.register({
      firstName: value.firstName!,
      lastName: value.lastName!,
      username: value.username!,
      password: value.password!,
      role: value.role!
    }).subscribe({
      next: (user) => {
        this.successMessage.set(`Korisnik "${user.username}" je uspešno registrovan.`);
        this.form.reset();
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.errorMessage.set('Korisničko ime već postoji.');
        } else if (err.status === 400 && err.error && typeof err.error === 'object') {
          this.fieldErrors.set(err.error as Record<string, string>);
        } else {
          this.errorMessage.set('Greška pri registraciji. Pokušajte ponovo.');
        }
        this.loading.set(false);
      }
    });
  }
}
