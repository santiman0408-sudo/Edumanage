import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserRole } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive]
})
export class AppComponent {
  authService = inject(AuthService);
  // FIX: Add explicit Router type to fix type inference issue.
  router: Router = inject(Router);

  // Expose UserRole enum to the template
  UserRole = UserRole;

  get currentUrl(): string {
    return this.router.url;
  }
  
  logout() {
    this.authService.logout();
  }

  getTranslatedTitle(): string {
    const path = this.router.url.replace('/', '');
    switch (path) {
        case 'dashboard': return 'Panel de Control';
        case 'courses': return 'Cursos';
        case 'users': return 'Usuarios';
        default: 
          const capitalized = path.charAt(0).toUpperCase() + path.slice(1);
          return capitalized;
    }
  }

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
