import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Course } from '../models/course.model';

const MOCK_COURSES: Course[] = [
  { id: 1, title: 'Introducción a Angular', description: 'Aprende los fundamentos del framework Angular.', professor: 'Profesor Oak', credits: 3 },
  { id: 2, title: 'Tailwind CSS Avanzado', description: 'Domina el diseño responsivo con Tailwind CSS.', professor: 'Profesor Elm', credits: 4 },
  { id: 3, title: 'Gestión de Estado con Signals', description: 'Profundiza en la gestión de estado moderna.', professor: 'Profesor Oak', credits: 3 },
  { id: 4, title: 'Fundamentos de Seguridad Web', description: 'Comprende las vulnerabilidades web comunes y cómo prevenirlas.', professor: 'Profesor Elm', credits: 2 },
];

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private courses = signal<Course[]>([...MOCK_COURSES]);

  getCourses(): Observable<Course[]> {
    console.log('Fetching courses (simulated HTTP call)');
    return of(this.courses()).pipe(delay(600));
  }
  
  addCourse(course: Omit<Course, 'id'>): Observable<Course> {
    const newCourse: Course = {
        ...course,
        id: Math.max(...this.courses().map(c => c.id)) + 1,
    };
    this.courses.update(courses => [...courses, newCourse]);
    return of(newCourse).pipe(delay(300));
  }
  
  deleteCourse(id: number): Observable<void> {
    const courseExists = this.courses().some(c => c.id === id);
    if (!courseExists) {
        return throwError(() => new Error('Curso no encontrado'));
    }
    this.courses.update(courses => courses.filter(c => c.id !== id));
    return of(undefined).pipe(delay(300));
  }

  updateCourse(updatedCourse: Course): Observable<Course> {
    const index = this.courses().findIndex(c => c.id === updatedCourse.id);
    if (index === -1) {
      return throwError(() => new Error('Curso no encontrado para actualizar'));
    }
    this.courses.update(courses => {
      const newCourses = [...courses];
      newCourses[index] = updatedCourse;
      return newCourses;
    });
    return of(updatedCourse).pipe(delay(300));
  }
}