import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Se elimina RouterLink porque no se usa
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { CoursesService, Course } from '../../services/courses.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Se elimina RouterLink de los imports
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  filteredCourses$!: Observable<Course[]>;
  currentUser$: Observable<User | null>;
  
  // CORRECCIÓN: Se quita 'private' para que la propiedad sea pública y accesible desde el template.
  categoryFilter$ = new BehaviorSubject<string>('all');
  private searchTerm$ = new BehaviorSubject<string>('');

  courseForm!: FormGroup;
  isModalOpen = false;
  editingCourseId: string | null = null;
  
  categories = ['all', 'design', 'development', 'marketing', 'engineering', 'brand'];

  constructor(
    private coursesService: CoursesService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.initializeForm();

    this.filteredCourses$ = combineLatest([
      this.coursesService.courses$,
      this.categoryFilter$.pipe(startWith('all')),
      this.searchTerm$.pipe(startWith(''))
    ]).pipe(
      map(([courses, category, term]) => {
        return courses.filter(course => {
          const matchesCategory = category === 'all' || course.category === category;
          const matchesSearch = term === '' || course.title.toLowerCase().includes(term.toLowerCase());
          return matchesCategory && matchesSearch;
        });
      })
    );
  }

  initializeForm(course?: Course): void {
    this.courseForm = this.fb.group({
      title: [course?.title || '', Validators.required],
      description: [course?.description || '', Validators.required],
      price: [course?.price || 0, [Validators.required, Validators.min(0)]],
      category: [course?.category || '', Validators.required],
      image: [course?.image || ''],
      tags: [course?.tags?.join(', ') || '']
    });
  }

  setCategoryFilter(category: string): void {
    this.categoryFilter$.next(category);
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm$.next(term);
  }

  openCourseModal(course?: Course): void {
    if (course) {
      this.editingCourseId = course.id;
      this.initializeForm(course);
    } else {
      this.editingCourseId = null;
      this.initializeForm();
    }
    this.isModalOpen = true;
  }

  closeCourseModal(): void {
    this.isModalOpen = false;
  }

  onCourseSubmit(): void {
    if (this.courseForm.invalid) return;

    const formValue = this.courseForm.value;
    const courseData = {
      ...formValue,
      tags: formValue.tags.split(',').map((tag: string) => tag.trim())
    };

    if (this.editingCourseId) {
      this.coursesService.updateCourse(this.editingCourseId, courseData);
    } else {
      this.coursesService.addCourse(courseData);
    }
    this.closeCourseModal();
  }

  onDeleteCourse(courseId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      this.coursesService.deleteCourse(courseId);
    }
  }
  
  viewCourseDetail(courseId: string): void {
    console.log('Navegando al detalle del curso:', courseId);
    // this.router.navigate(['/course', courseId]); // Descomentar cuando la ruta exista
  }
}
