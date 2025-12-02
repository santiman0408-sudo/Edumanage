import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  userService = inject(UserService);
  
  users = signal<User[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // For adding new user
  showAddForm = signal(false);
  newUser = signal<{ name: string; email: string; role: UserRole }>({ name: '', email: '', role: UserRole.Student });
  userRoles = Object.values(UserRole);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los usuarios.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }
  
  addUser() {
    if (!this.newUser().name || !this.newUser().email) return;

    this.userService.addUser(this.newUser()).subscribe({
      next: (addedUser) => {
        this.users.update(currentUsers => [...currentUsers, addedUser]);
        this.resetAddForm();
      },
      error: (err) => {
        this.error.set('Error al añadir el usuario.');
        console.error(err);
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        this.userService.deleteUser(id).subscribe({
            next: () => {
                this.users.update(currentUsers => currentUsers.filter(u => u.id !== id));
            },
            error: (err) => {
                this.error.set('Error al eliminar el usuario.');
                console.error(err);
            }
        });
    }
  }

  resetAddForm() {
    this.showAddForm.set(false);
    this.newUser.set({ name: '', email: '', role: UserRole.Student });
  }

  translateRole(role: UserRole): string {
    switch (role) {
      case UserRole.Admin: return 'Administrador';
      case UserRole.Professor: return 'Profesor';
      case UserRole.Student: return 'Estudiante';
      default: return role;
    }
  }
}