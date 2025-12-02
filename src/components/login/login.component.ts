import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AuthService);
  // FIX: Add explicit Router type to fix type inference issue.
  router: Router = inject(Router);

  email = signal('admin@test.com');
  password = signal('password');
  loading = signal(false);
  error = signal('');

  login() {
    this.loading.set(true);
    this.error.set('');
    this.authService.login(this.email(), this.password())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.token) {
            this.router.navigate(['/dashboard']);
          } else {
            this.error.set('Correo electrónico o contraseña no válidos.');
          }
        },
        error: (err) => {
          this.error.set('Ocurrió un error inesperado. Por favor, inténtelo de nuevo.');
          console.error(err);
        }
      });
  }

  setCredentials(type: 'admin' | 'professor' | 'student') {
    if (type === 'admin') {
      this.email.set('admin@test.com');
    } else if (type === 'professor') {
      this.email.set('professor@test.com');
    } else {
      this.email.set('student@test.com');
    }
    this.password.set('password'); // Password is not validated in mock
  }
}
