import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { ClassroomService, CourseWithContent, Module, Lesson } from '../../services/classroom.service';

@Component({
  selector: 'app-aula',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './aula.component.html',
  styleUrls: ['./aula.component.css']
})
export class AulaComponent implements OnInit {
  course$!: Observable<CourseWithContent | null>;
  
  // Estado de la UI
  selectedLesson: Lesson | null = null;
  activeTab: 'video' | 'materials' | 'quiz' | 'notes' = 'video';

  constructor(
    private route: ActivatedRoute,
    private classroomService: ClassroomService
  ) {}

  ngOnInit(): void {
    // Usamos switchMap para obtener el ID de la ruta y luego llamar al servicio
    this.course$ = this.route.paramMap.pipe(
      switchMap(params => {
        const courseId = params.get('courseId');
        if (courseId) {
          return this.classroomService.getCourseContent(courseId);
        }
        return new Observable<null>(sub => sub.next(null)); // Devuelve un observable nulo si no hay ID
      })
    );

    // Seleccionar la primera lección por defecto
    this.course$.subscribe(course => {
      if (course && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
        this.selectLesson(course.modules[0].lessons[0]);
      }
    });
  }

  selectLesson(lesson: Lesson): void {
    this.selectedLesson = lesson;
    this.activeTab = 'video'; // Siempre vuelve a la pestaña de video al cambiar de lección
  }

  setTab(tabName: 'video' | 'materials' | 'quiz' | 'notes'): void {
    this.activeTab = tabName;
  }
}
