import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { of, delay, tap, Observable } from 'rxjs';
import { User, UserRole, DecodedToken } from '../models/user.model';

// Mock user data
const MOCK_USERS: Omit<User, 'id'>[] = [
  { name: 'Usuario Administrador', email: 'admin@test.com', role: UserRole.Admin },
  { name: 'Profesor Oak', email: 'professor@test.com', role: UserRole.Professor },
  { name: 'Estudiante Ash', email: 'student@test.com', role: UserRole.Student },
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // FIX: Add explicit Router type to fix type inference issue.
  private router: Router = inject(Router);
  
  private authToken = signal<string | null>(localStorage.getItem('authToken'));
  
  currentUser = signal<DecodedToken | null>(null);
  isAuthenticated = computed(() => !!this.authToken());
  isAdmin = computed(() => this.currentUser()?.role === UserRole.Admin);

  constructor() {
    this.decodeAndSetUser(this.authToken());
    effect(() => {
        const token = this.authToken();
        if (token) {
            localStorage.setItem('authToken', token);
            this.decodeAndSetUser(token);
        } else {
            localStorage.removeItem('authToken');
            this.currentUser.set(null);
        }
    });
  }

  private decodeAndSetUser(token: string | null) {
      if (token) {
          try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              this.currentUser.set(payload);
          } catch (e) {
              console.error('Failed to decode token', e);
              this.logout();
          }
      } else {
        this.currentUser.set(null);
      }
  }

  private createFakeJwt(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload: DecodedToken = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
    };
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'mock-signature'; // In a real app, this would be a crypto signature
    return `${header}.${encodedPayload}.${signature}`;
  }
  
  login(email: string, password: string): Observable<{token: string}> {
    // This is a mock login. In a real app, you'd send credentials to a server.
    // The password is not checked here for simplicity.
    const foundUser = MOCK_USERS.find(u => u.email === email);
    
    if (foundUser) {
        const userWithId = { ...foundUser, id: MOCK_USERS.indexOf(foundUser) + 1 };
        const token = this.createFakeJwt(userWithId);
        return of({ token }).pipe(
            delay(1000), // Simulate network latency
            tap(response => {
              this.authToken.set(response.token);
            })
        );
    }
    return of({token: ''}); // Simulate login failure
  }

  logout() {
    this.authToken.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.authToken();
  }
}
