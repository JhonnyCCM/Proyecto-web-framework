import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Observable } from 'rxjs';

// Importa el servicio y las interfaces de autenticación
import { AuthService, User } from '../../services/auth.service'; // Asegúrate que la ruta sea correcta

// Interfaz para los Cursos (la mantenemos como la tenías)
interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  tags: string[];
  duration: string;
  level: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  startDate: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink], // Asegúrate que RouterLink esté aquí para los botones
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // --- Referencias al DOM (se mantienen como las tenías) ---
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;
  @ViewChild('carouselIndicators') carouselIndicators!: ElementRef<HTMLDivElement>;
  @ViewChild('prevBtn') prevBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('nextBtn') nextBtn!: ElementRef<HTMLButtonElement>;

  // --- Propiedades Reactivas y del Componente ---
  currentUser$: Observable<User | null>; // NUEVA: Propiedad reactiva para el usuario
  courses: Course[] = [];
  currentSlide: number = 0;
  totalSlides: number = 0;
  autoSlideInterval: any = null;
  math = Math; // Exponer Math para el template
  private observer: IntersectionObserver | undefined;

  // --- Inyección de Dependencias ---
  constructor(
    private router: Router,
    private authService: AuthService, // NUEVO: Inyectamos el servicio de autenticación
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Asignamos el observable del servicio a nuestra propiedad local
    this.currentUser$ = this.authService.currentUser$;
  }

  // --- Ciclo de Vida de Angular ---
  ngOnInit(): void {
    this.loadFeaturedCourses();
    // Ya NO necesitamos llamar a updateUserInfo() aquí. El template lo hará automáticamente.
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.carouselTrack && this.prevBtn && this.nextBtn) {
        this.setupCarousel();
        this.startAutoSlide();
      }
      this.setupAnimations();
    }
  }

  ngOnDestroy(): void {
    this.pauseAutoSlide();
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  
  // --- Métodos de Autenticación (para simulación) ---
  simularLogin(): void {
    const mockUser: User = {
      fullName: 'Jonny Test',
      role: 'Estudiante',
      avatar: 'https://avatars.githubusercontent.com/u/1014?v=4'
    };
    this.authService.login(mockUser);
  }

  simularLogout(): void {
    this.authService.logout();
  }

  // --- Lógica del Carrusel y Animaciones (tu código original) ---

  loadFeaturedCourses(): void {
    // Tu lógica para cargar cursos se mantiene
    this.courses = [
        { id: '1', title: 'Diseño UX/UI Avanzado', description: 'Aprende a crear interfaces intuitivas y atractivas.', image: 'https://via.placeholder.com/350x200?text=UXUI+Design', rating: 4.8, tags: ['Diseño', 'UX', 'UI'], duration: '8 semanas', level: 'Intermedio', instructor: 'Ana García', price: 120, originalPrice: 150, discount: 20, startDate: '2024-09-01' },
        { id: '2', title: 'Desarrollo Web Full Stack', description: 'Domina el frontend y el backend con las últimas tecnologías.', image: 'https://via.placeholder.com/350x200?text=Web+Dev', rating: 4.9, tags: ['Web', 'Backend', 'Frontend'], duration: '12 semanas', level: 'Avanzado', instructor: 'Carlos Díaz', price: 250, originalPrice: 300, discount: 16, startDate: '2024-10-15' },
        { id: '3', title: 'Marketing Digital Estratégico', description: 'Crea campañas exitosas y optimiza tu presencia online.', image: 'https://via.placeholder.com/350x200?text=Marketing', rating: 4.7, tags: ['Marketing', 'SEO', 'SEM'], duration: '6 semanas', level: 'Principiante', instructor: 'Laura Fernández', price: 99, startDate: '2024-08-20' },
        { id: '4', title: 'Análisis de Datos con Python', description: 'Descubre insights y toma decisiones basadas en datos.', image: 'https://via.placeholder.com/350x200?text=Data+Science', rating: 4.6, tags: ['Data Science', 'Python', 'Analytics'], duration: '10 semanas', level: 'Intermedio', instructor: 'Miguel Torres', price: 180, startDate: '2024-11-01' },
    ];
    this.totalSlides = Math.ceil(this.courses.length / this.getVisibleSlides());
  }

  setupCarousel(): void {
    // Tu lógica del carrusel se mantiene intacta
    this.prevBtn.nativeElement.addEventListener("click", () => this.prevSlide());
    this.nextBtn.nativeElement.addEventListener("click", () => this.nextSlide());
    this.createIndicators();
    this.updateCarousel();
    // ...resto de tu lógica de carrusel...
  }
  
  getVisibleSlides(): number {
    if (isPlatformBrowser(this.platformId)) {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1024) return 2;
        return 3;
    }
    return 1;
  }

  createIndicators(): void {
    if (!this.carouselIndicators) return;
    this.carouselIndicators.nativeElement.innerHTML = "";
    for (let i = 0; i < this.totalSlides; i++) {
      const indicator = document.createElement("div");
      indicator.className = `carousel-indicator w-3 h-3 rounded-full bg-base-300 cursor-pointer transition-all duration-300`;
      indicator.addEventListener("click", () => this.goToSlide(i));
      this.carouselIndicators.nativeElement.appendChild(indicator);
    }
  }

  updateCarousel(): void {
    // Tu lógica de carrusel se mantiene
    if (!this.carouselTrack || !this.carouselIndicators) return;
    const slideWidth = 100 / this.getVisibleSlides();
    const translateX = -this.currentSlide * (slideWidth + 2); // Ajusta el 2% según tu 'gap'
    this.carouselTrack.nativeElement.style.transform = `translateX(${translateX}%)`;
  }
  
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateCarousel();
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
    this.updateCarousel();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.updateCarousel();
  }

  startAutoSlide(): void {
    // Tu lógica de auto-slide se mantiene
  }

  pauseAutoSlide(): void {
    // Tu lógica de pausar auto-slide se mantiene
  }

  setupAnimations(): void {
    // Tu lógica de IntersectionObserver se mantiene
  }
  
  // --- Funciones de Navegación y Utilitarias ---
  goToCourses(): void {
    this.router.navigate(['/cursos']);
  }

  viewCourse(courseId: string): void {
    this.router.navigate(['/cursos', courseId]);
  }

  formatDate(dateString: string): string {
    if (isPlatformBrowser(this.platformId)) {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    }
    return dateString;
  }
}