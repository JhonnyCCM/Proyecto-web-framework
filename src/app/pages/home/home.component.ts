import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // Importar isPlatformBrowser
import { RouterLink, Router } from '@angular/router';

// Define las interfaces para tipado
interface User {
  fullName: string;
  role: string;
  name?: string;
  avatar?: string;
}

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
  imports: [CommonModule,],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css' // O .scss si usas SCSS
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // Referencias a elementos del DOM usando ViewChild
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;
  @ViewChild('carouselIndicators') carouselIndicators!: ElementRef<HTMLDivElement>;
  @ViewChild('prevBtn') prevBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('nextBtn') nextBtn!: ElementRef<HTMLButtonElement>;

  // Propiedades del componente
  currentUser: User | null = null;
  currentSlide: number = 0;
  totalSlides: number = 0;
  autoSlideInterval: any = null;
  courses: Course[] = [];

  // Exponer el objeto Math para usarlo directamente en el template
  math = Math;

  // IntersectionObserver para animaciones
  private observer: IntersectionObserver | undefined;

  // Inyecta Router y PLATFORM_ID para compatibilidad con SSR
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    this.loadFeaturedCourses();
    this.updateUserInfo();
    this.loadUserStats();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.carouselTrack && this.prevBtn && this.nextBtn) {
        this.setupCarousel();
        this.startAutoSlide();
      } else {
        console.warn('Algunos elementos del carrusel no están disponibles en la vista.');
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

  // --- Implementación básica de StorageService (debería ser un servicio inyectable) ---
  private storageService = {
    get: (key: string) => {
      if (isPlatformBrowser(this.platformId)) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
      return null; // Retorna null en entorno SSR
    },
    set: (key: string, value: any) => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },
  };

  // --- Métodos de Lógica de Negocio y UI ---

  loadFeaturedCourses(): void {
    if (isPlatformBrowser(this.platformId)) {
      const coursesData: Course[] = this.storageService.get("courses") || [
        // Datos de ejemplo para que el carrusel tenga contenido inicial
        { id: '1', title: 'Diseño UX/UI Avanzado', description: 'Aprende a crear interfaces intuitivas y atractivas.', image: 'https://via.placeholder.com/350x200?text=UXUI+Design', rating: 4.8, tags: ['Diseño', 'UX', 'UI'], duration: '8 semanas', level: 'Intermedio', instructor: 'Ana García', price: 120, originalPrice: 150, discount: 20, startDate: '2024-09-01' },
        { id: '2', title: 'Desarrollo Web Full Stack', description: 'Domina el frontend y el backend con las últimas tecnologías.', image: 'https://via.placeholder.com/350x200?text=Web+Dev', rating: 4.9, tags: ['Web', 'Backend', 'Frontend'], duration: '12 semanas', level: 'Avanzado', instructor: 'Carlos Díaz', price: 250, originalPrice: 300, discount: 16, startDate: '2024-10-15' },
        { id: '3', title: 'Marketing Digital Estratégico', description: 'Crea campañas exitosas y optimiza tu presencia online.', image: 'https://via.placeholder.com/350x200?text=Marketing', rating: 4.7, tags: ['Marketing', 'SEO', 'SEM'], duration: '6 semanas', level: 'Principiante', instructor: 'Laura Fernández', price: 99, startDate: '2024-08-20' },
        { id: '4', title: 'Análisis de Datos con Python', description: 'Descubre insights y toma decisiones basadas en datos.', image: 'https://via.placeholder.com/350x200?text=Data+Science', rating: 4.6, tags: ['Data Science', 'Python', 'Analytics'], duration: '10 semanas', level: 'Intermedio', instructor: 'Miguel Torres', price: 180, startDate: '2024-11-01' },
        { id: '5', title: 'Ciberseguridad para Desarrolladores', description: 'Protege tus aplicaciones de las amenazas modernas.', image: 'https://via.placeholder.com/350x200?text=Cybersecurity', rating: 4.5, tags: ['Seguridad', 'DevOps'], duration: '7 semanas', level: 'Intermedio', instructor: 'Sofía Ramos', price: 160, startDate: '2024-09-25' },
        { id: '6', title: 'Inteligencia Artificial con TensorFlow', description: 'Construye modelos de IA y aprendizaje profundo.', image: 'https://via.placeholder.com/350x200?text=AI', rating: 4.9, tags: ['IA', 'Machine Learning'], duration: '14 semanas', level: 'Avanzado', instructor: 'Roberto Soto', price: 320, originalPrice: 400, discount: 20, startDate: '2024-12-01' },
      ];
      this.courses = coursesData.slice(0, 6);
      this.totalSlides = this.math.ceil(this.courses.length / this.getVisibleSlides());
    } else {
      // Proporcionar datos estáticos o vacíos para SSR para evitar errores
      this.courses = [];
      this.totalSlides = 0;
    }
  }

  setupCarousel(): void {
    this.prevBtn.nativeElement.addEventListener("click", () => this.prevSlide());
    this.nextBtn.nativeElement.addEventListener("click", () => this.nextSlide());

    // Soporte para Touch/Swipe
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    this.carouselTrack.nativeElement.addEventListener("touchstart", (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.pauseAutoSlide();
    });

    this.carouselTrack.nativeElement.addEventListener("touchmove", (e: TouchEvent) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });

    this.carouselTrack.nativeElement.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;

      const diff = startX - currentX;
      if (this.math.abs(diff) > 50) { // Umbral para considerar un swipe
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
      this.startAutoSlide();
    });

    // Inicializar indicadores y carrusel
    this.createIndicators();
    this.updateCarousel();

    // Event listener para redimensionamiento de ventana
    if (isPlatformBrowser(this.platformId)) {
        window.addEventListener("resize", () => {
        const newTotalSlides = this.math.ceil(this.courses.length / this.getVisibleSlides());
        if (newTotalSlides !== this.totalSlides) {
          this.totalSlides = newTotalSlides;
          this.currentSlide = 0;
          this.createIndicators();
          this.updateCarousel();
        }
      });
    }
  }

  getVisibleSlides(): number {
    if (isPlatformBrowser(this.platformId)) {
      const width = window.innerWidth;
      if (width < 480) return 1;
      if (width < 768) return 1;
      if (width < 1024) return 2;
      return 3;
    }
    return 1; // Valor por defecto para SSR
  }

  createIndicators(): void {
    if (!this.carouselIndicators) return;

    this.carouselIndicators.nativeElement.innerHTML = "";
    for (let i = 0; i < this.totalSlides; i++) {
      const indicator = document.createElement("div");
      indicator.className = `w-3 h-3 rounded-full bg-border-color cursor-pointer transition-all duration-300 ${i === 0 ? "bg-primary scale-125" : ""}`;
      indicator.addEventListener("click", () => this.goToSlide(i));
      this.carouselIndicators.nativeElement.appendChild(indicator);
    }
  }

  updateCarousel(): void {
    if (!this.carouselTrack || !this.carouselIndicators) return;

    const slideWidth = 100 / this.getVisibleSlides();
    const translateX = -this.currentSlide * slideWidth;
    this.carouselTrack.nativeElement.style.transform = `translateX(${translateX}%)`;

    const indicators = this.carouselIndicators.nativeElement.querySelectorAll(".carousel-indicator");
    indicators.forEach((indicator, index) => {
      if (index === this.currentSlide) {
        indicator.classList.add("bg-primary", "scale-125");
        indicator.classList.remove("bg-border-color");
      } else {
        indicator.classList.add("bg-border-color");
        indicator.classList.remove("bg-primary", "scale-125");
      }
    });
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
    this.pauseAutoSlide();
    this.startAutoSlide();
  }

  startAutoSlide(): void {
    this.pauseAutoSlide();
    if (isPlatformBrowser(this.platformId)) {
      this.autoSlideInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    }
  }

  pauseAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  updateUserInfo(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUser = this.storageService.get("currentUser");
      const userNameElement = document.getElementById("userName"); // Usar ViewChild si es un elemento dentro del componente
      if (userNameElement && this.currentUser) {
        userNameElement.textContent = this.currentUser.fullName || this.currentUser.name || 'Usuario';
      }
    }
  }

  setupAnimations(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).style.opacity = "1";
              (entry.target as HTMLElement).style.transform = "translateY(0)";
            }
          });
        },
        { threshold: 0.1 },
      );

      document.querySelectorAll(".stat-card, .benefit-card, .testimonial-card").forEach((el) => {
        (el as HTMLElement).style.opacity = "0";
        (el as HTMLElement).style.transform = "translateY(20px)";
        (el as HTMLElement).style.transition = "all 0.6s ease";
        this.observer?.observe(el);
      });

      this.animateCounters();
    }
  }

  animateCounters(): void {
    if (isPlatformBrowser(this.platformId)) {
      const counters = document.querySelectorAll(".metric-number");
      counters.forEach((counter) => {
        const textContent = counter.textContent || "";
        const targetMatch = textContent.match(/(\d+(\.\d+)?)/);
        const target = targetMatch ? parseFloat(targetMatch[1]) : 0;
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        let prefix = textContent.startsWith('+') ? '+' : '';
        let suffix = textContent.endsWith('%') ? '%' : '';

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          counter.textContent = `${prefix}${this.math.floor(current)}${suffix}`;
        }, 16);
      });
    }
  }

  loadUserStats(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stats = {
        progress: 75,
        certificates: 3,
        studyTime: 24.5,
        streak: 12,
      };

      const progressFill = document.querySelector(".progress-fill") as HTMLElement;
      if (progressFill) {
        setTimeout(() => {
          progressFill.style.width = `${stats.progress}%`;
        }, 500);
      }
    }
  }

  // --- Funciones de navegación ---
  goToCourses(): void {
    this.router.navigate(['/cursos']);
  }

  viewCourse(courseId: string): void {
    console.log(`Ver curso: ${courseId}`);
    this.router.navigate(['/cursos', courseId]);
  }

  // --- Funciones utilitarias ---
  formatDate(dateString: string): string {
    if (isPlatformBrowser(this.platformId)) { // También proteger si Date.toLocaleDateString causa problemas en SSR
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
    }
    return dateString; // Retornar el string original en SSR
  }

  toggleUserMenu(): void {
    console.log("Toggle user menu (Lógica para abrir/cerrar menú de usuario)");
  }
}