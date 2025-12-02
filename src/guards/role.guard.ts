import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  // FIX: Add explicit Router type to fix type inference issue.
  const router: Router = inject(Router);
  const expectedRoles = route.data['roles'] as string[];

  const currentUser = authService.currentUser();
  
  if (!authService.isAuthenticated() || !currentUser || !expectedRoles.includes(currentUser.role)) {
    // Redirect to dashboard or a 'not authorized' page if the user doesn't have the required role
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
