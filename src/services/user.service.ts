import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, tap, throwError } from 'rxjs';
import { User, UserRole } from '../models/user.model';

const MOCK_USERS: User[] = [
  { id: 1, name: 'Usuario Administrador', email: 'admin@test.com', role: UserRole.Admin },
  { id: 2, name: 'Profesor Oak', email: 'professor@test.com', role: UserRole.Professor },
  { id: 3, name: 'Estudiante Ash', email: 'student@test.com', role: UserRole.Student },
  { id: 4, name: 'Estudiante Misty', email: 'misty@test.com', role: UserRole.Student },
  { id: 5, name: 'Profesor Elm', email: 'elm@test.com', role: UserRole.Professor },
];

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users = signal<User[]>([...MOCK_USERS]);

  getUsers(): Observable<User[]> {
    console.log('Fetching users (simulated HTTP call)');
    return of(this.users()).pipe(delay(500));
  }
  
  addUser(user: Omit<User, 'id'>): Observable<User> {
    const newUser: User = {
        ...user,
        id: Math.max(...this.users().map(u => u.id)) + 1,
    };
    this.users.update(users => [...users, newUser]);
    return of(newUser).pipe(delay(300));
  }
  
  deleteUser(id: number): Observable<void> {
    const userExists = this.users().some(u => u.id === id);
    if (!userExists) {
        return throwError(() => new Error('Usuario no encontrado'));
    }
    this.users.update(users => users.filter(u => u.id !== id));
    return of(undefined).pipe(delay(300));
  }
}
