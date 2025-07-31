import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Course, CoursesService } from './courses.service'; // Reutilizamos la interfaz Course

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz';
  duration: string;
  videoUrl?: string;
  description: string;
  completed: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface CourseWithContent extends Course {
  modules: Module[];
}

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  // Simula una base de datos de contenido de cursos
  private courseContentDb: { [key: string]: Module[] } = {
    'course_1': [ // Contenido para UI/UX Designer
      {
        id: "module_1", title: "Fundamentos de UI/UX", description: "Principios básicos del diseño",
        lessons: [
          { id: "lesson_1_1", title: "Introducción a los Principios de Diseño", type: "video", duration: "12:45", videoUrl: "#", description: "Aprenderás los principios fundamentales del diseño UI/UX.", completed: true },
          { id: "lesson_1_2", title: "Jerarquía Visual", type: "video", duration: "15:30", videoUrl: "#", description: "Aprende a crear jerarquías visuales efectivas.", completed: false },
          { id: "lesson_1_3", title: "Quiz: Principios Básicos", type: "quiz", duration: "10:00", description: "Evalúa tu comprensión.", completed: false },
        ]
      },
      {
        id: "module_2", title: "Diseño de Interfaces", description: "Creación de interfaces efectivas",
        lessons: [
          { id: "lesson_2_1", title: "Wireframes y Prototipos", type: "video", duration: "18:20", videoUrl: "#", description: "Aprende a crear wireframes y prototipos.", completed: false },
        ]
      }
    ],
    // Puedes añadir más contenido para otros cursos aquí
  };

  constructor(private coursesService: CoursesService) { }

  getCourseContent(courseId: string): Observable<CourseWithContent | null> {
    // 1. Obtiene el curso base desde CoursesService (simulado)
    const allCourses = JSON.parse(localStorage.getItem('courses') || '[]') as Course[];
    const courseBase = allCourses.find(c => c.id === courseId);

    if (!courseBase) {
      return of(null);
    }

    // 2. Obtiene los módulos y lecciones de nuestra "base de datos"
    const modules = this.courseContentDb[courseId] || [];

    // 3. Combina la información
    const fullCourseData: CourseWithContent = {
      ...courseBase,
      modules: modules
    };

    return of(fullCourseData);
  }

  // En una app real, estos métodos actualizarían el estado en el backend/localStorage
  toggleLessonCompletion(courseId: string, lessonId: string): void {
    console.log(`Marcando lección ${lessonId} del curso ${courseId} como completada/incompleta.`);
    // Aquí iría la lógica para actualizar el estado de la lección
  }
}
