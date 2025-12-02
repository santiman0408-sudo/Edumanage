import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesComponent implements OnInit {
  courseService = inject(CourseService);
  authService = inject(AuthService);

  courses = signal<Course[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Modal and editing signals
  selectedCourse = signal<Course | null>(null);
  isEditingCourse = signal(false);
  editedCourse = signal<Course | null>(null);

  // Filter signals
  searchTerm = signal('');
  selectedProfessor = signal('');
  selectedCredits = signal('');

  uniqueProfessors = computed(() => {
    const professors = this.courses().map(course => course.professor);
    return [...new Set(professors)];
  });

  uniqueCredits = computed(() => {
    const credits = this.courses().map(course => course.credits);
    return [...new Set(credits)].sort((a, b) => a - b);
  });

  filteredCourses = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const professor = this.selectedProfessor();
    const credits = this.selectedCredits();

    return this.courses().filter(course => {
      const termMatch = term ? course.title.toLowerCase().includes(term) || course.description.toLowerCase().includes(term) : true;
      const professorMatch = professor ? course.professor === professor : true;
      const creditsMatch = credits ? course.credits === +credits : true;
      return termMatch && professorMatch && creditsMatch;
    });
  });

  isAdmin = this.authService.isAdmin;
  showAddForm = signal(false);
  newCourse = signal<Omit<Course, 'id'>>({ title: '', description: '', professor: '', credits: 3 });

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.isLoading.set(true);
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los cursos.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }
  
  addCourse() {
    if (!this.newCourse().title || !this.newCourse().description || !this.newCourse().professor) return;

    this.courseService.addCourse(this.newCourse()).subscribe({
      next: (addedCourse) => {
        this.courses.update(currentCourses => [...currentCourses, addedCourse]);
        this.resetAddForm();
      },
      error: (err) => {
        this.error.set('Error al añadir el curso.');
        console.error(err);
      }
    });
  }

  deleteCourse(id: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent modal from opening
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
        this.courseService.deleteCourse(id).subscribe({
            next: () => {
                this.courses.update(currentCourses => currentCourses.filter(c => c.id !== id));
            },
            error: (err) => {
                this.error.set('Error al eliminar el curso.');
                console.error(err);
            }
        });
    }
  }

  resetAddForm() {
    this.showAddForm.set(false);
    this.newCourse.set({ title: '', description: '', professor: '', credits: 3 });
  }

  resetFilters() {
    this.searchTerm.set('');
    this.selectedProfessor.set('');
    this.selectedCredits.set('');
  }

  // Modal methods
  selectCourse(course: Course) {
    this.selectedCourse.set(course);
    this.editedCourse.set({ ...course });
  }

  closeModal() {
    this.selectedCourse.set(null);
    this.isEditingCourse.set(false);
    this.editedCourse.set(null);
  }

  startEdit() {
    this.isEditingCourse.set(true);
  }

  cancelEdit() {
    this.isEditingCourse.set(false);
    this.editedCourse.set({ ...this.selectedCourse()! });
  }

  saveCourse() {
    if (!this.editedCourse()) return;

    this.courseService.updateCourse(this.editedCourse()!).subscribe({
      next: (updatedCourse) => {
        this.courses.update(courses => 
          courses.map(c => c.id === updatedCourse.id ? updatedCourse : c)
        );
        this.closeModal();
      },
      error: (err) => {
        this.error.set('Error al actualizar el curso.');
        console.error(err);
      }
    });
  }
}