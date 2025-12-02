import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  // FIX: Add explicit Router type to fix type inference issue.
  const router: Router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to the login page
  router.navigate(['/login']);
  return false;
};
