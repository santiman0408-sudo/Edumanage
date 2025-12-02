import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  translateRole(role: UserRole | undefined | null): string {
    if (!role) return '';
    switch (role) {
        case UserRole.Admin: return 'Administrador';
        case UserRole.Professor: return 'Profesor';
        case UserRole.Student: return 'Estudiante';
        default: return '';
    }
  }
}