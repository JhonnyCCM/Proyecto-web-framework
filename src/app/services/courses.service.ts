import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  tags: string[];
  rating: number;
  startDate: string;
  endDate: string;
  instructor: string;
  duration: string;
  level: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  public courses$ = this.coursesSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.createInitialData();
      const courses = JSON.parse(localStorage.getItem('courses') || '[]');
      this.coursesSubject.next(courses);
    }
  }

  private createInitialData(): void {
    const existingCourses = localStorage.getItem("courses");
    if (existingCourses) return;

    const initialCourses: Course[] = [
      { id: "course_1", title: "UI/UX Designer", description: "Un curso online para aquellos que quieren profundizar en el diseño UI/UX", price: 1600, image: "https://placehold.co/600x400/6366f1/ffffff?text=UI/UX", category: "design", tags: ["UI/UX", "Web"], rating: 5.0, startDate: "2023-11-15", endDate: "2024-01-17", instructor: "John Wilson", duration: "8 weeks", level: "Intermediate", isActive: true },
      { id: "course_2", title: "Python from scratch", description: "Este curso proporciona una introducción completa al lenguaje de programación Python", price: 2000, originalPrice: 2400, discount: 17, image: "https://placehold.co/600x400/10b981/ffffff?text=Python", category: "development", tags: ["Python", "Development"], rating: 4.7, startDate: "2023-11-15", endDate: "2024-01-30", instructor: "Sofia Harris", duration: "10 weeks", level: "Beginner", isActive: true },
      { id: "course_3", title: "Digital Marketing Mastery", description: "Aprende los fundamentos del marketing digital y haz crecer tu presencia online", price: 1200, originalPrice: 1500, discount: 20, image: "https://placehold.co/600x400/f59e0b/ffffff?text=Marketing", category: "marketing", tags: ["Marketing", "Digital", "SEO"], rating: 4.8, startDate: "2023-12-01", endDate: "2024-01-15", instructor: "Eva Smith", duration: "6 weeks", level: "Beginner", isActive: true },
    ];
    localStorage.setItem("courses", JSON.stringify(initialCourses));
  }

  addCourse(courseData: Partial<Course>): void {
    const courses = this.coursesSubject.value;
    const newCourse: Course = {
      id: `course_${Date.now()}`,
      isActive: true,
      ...courseData
    } as Course;
    const updatedCourses = [...courses, newCourse];
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    this.coursesSubject.next(updatedCourses);
  }

  updateCourse(courseId: string, updatedData: Partial<Course>): void {
    let courses = this.coursesSubject.value;
    courses = courses.map(course => 
      course.id === courseId ? { ...course, ...updatedData } : course
    );
    localStorage.setItem('courses', JSON.stringify(courses));
    this.coursesSubject.next(courses);
  }

  deleteCourse(courseId: string): void {
    let courses = this.coursesSubject.value;
    courses = courses.filter(course => course.id !== courseId);
    localStorage.setItem('courses', JSON.stringify(courses));
    this.coursesSubject.next(courses);
  }
}
