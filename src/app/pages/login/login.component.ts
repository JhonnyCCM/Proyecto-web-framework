import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para ngIf/ngClass
import { RouterLink, Router } from '@angular/router'; // Para routerLink y Router para navegación

@Component({
  selector: 'app-login',
  standalone: true, // Si tu componente es standalone (Angular 17+)
  imports: [CommonModule, RouterLink], // Importa CommonModule para directivas como *ngIf
  templateUrl: './login.component.html',
  styleUrl: './login.component.css' // Asegúrate de que el nombre sea correcto (o .scss)
})
export class LoginComponent implements OnInit, OnDestroy {
  // Propiedades del componente
  loginForm!: HTMLFormElement;
  forgotPasswordForm!: HTMLFormElement;
  showForgotPasswordModal: boolean = false;
  isLoading: boolean = false;

  // Inyecta Router para la navegación programática
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loginForm = document.getElementById('loginForm') as HTMLFormElement;
    this.forgotPasswordForm = document.getElementById('forgotPasswordForm') as HTMLFormElement;

    this.setupEventListeners();
    this.checkExistingSession();
    this.createDemoUsers();
  }

  ngOnDestroy(): void {
    // Implementa la lógica de limpieza aquí si es necesaria
  }

  // --- Métodos migrados y adaptados ---

  setupEventListeners(): void {
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPassword(e));

    // Event listeners para validación en tiempo real (pueden migrarse a eventos de Angular en el HTML)
    document.getElementById('email')?.addEventListener('blur', () => this.validateEmail());
    document.getElementById('password')?.addEventListener('blur', () => this.validatePassword());
  }

  // Adaptación simple de StorageService para este componente.
  // Idealmente, se movería a un servicio inyectable de Angular.
  private storageService = {
    get: (key: string) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    },
    set: (key: string, value: any) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
  };

  createDemoUsers(): void {
    const existingUsers = this.storageService.get("users") || [];

    const demoUsers = [
      {
        id: "admin_demo",
        fullName: "Administrador Demo",
        email: "admin@courseconnect.com",
        password: "admin123",
        role: "admin",
        newsletter: false,
        createdAt: new Date().toISOString(),
        isActive: true,
        profile: {
          avatar: null,
          bio: "Administrador del sistema",
          courses: [],
          progress: {},
        },
      },
      {
        id: "student_demo",
        fullName: "Estudiante Demo",
        email: "estudiante@courseconnect.com",
        password: "student123",
        role: "student",
        newsletter: true,
        createdAt: new Date().toISOString(),
        isActive: true,
        profile: {
          avatar: null,
          bio: "Estudiante entusiasta",
          courses: ["course_1", "course_2"],
          progress: {},
        },
      },
      {
        id: "instructor_demo",
        fullName: "Instructor Demo",
        email: "instructor@courseconnect.com",
        password: "instructor123",
        role: "instructor",
        newsletter: true,
        createdAt: new Date().toISOString(),
        isActive: true,
        profile: {
          avatar: null,
          bio: "Instructor experimentado",
          courses: [],
          progress: {},
        },
      },
    ];

    demoUsers.forEach((demoUser) => {
      if (!existingUsers.find((user: any) => user.email === demoUser.email)) {
        existingUsers.push(demoUser);
      }
    });

    this.storageService.set("users", existingUsers);
  }

  checkExistingSession(): void {
    const currentUser = this.storageService.get("currentUser");
    const rememberMe = localStorage.getItem("rememberMe") === "true";

    // Nota: Aunque la ruta inicial sea Home, si el usuario tiene sesión persistente,
    // es buena práctica redirigirlo si está en Login.
    if (currentUser && rememberMe) {
      this.redirectToDashboard();
    }
  }

  async handleLogin(e: Event): Promise<void> {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData(this.loginForm);
    const loginData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      rememberMe: formData.get("rememberMe") === "on",
    };

    try {
      this.setLoading(true);
      await this.authenticateUser(loginData);
    } catch (error: any) {
      this.showNotification(error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async authenticateUser(loginData: any): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simular delay

    const users = this.storageService.get("users") || [];
    const user = users.find((u: any) => u.email === loginData.email && u.password === loginData.password);

    if (!user) {
      throw new Error("Credenciales incorrectas. Verifica tu email y contraseña.");
    }

    if (!user.isActive) {
      throw new Error("Tu cuenta ha sido desactivada. Contacta al administrador.");
    }

    this.storageService.set("currentUser", user);
    localStorage.setItem("rememberMe", loginData.rememberMe.toString());

    user.lastLogin = new Date().toISOString();
    const updatedUsers = users.map((u: any) => (u.id === user.id ? user : u));
    this.storageService.set("users", updatedUsers);

    this.showNotification("¡Bienvenido de vuelta!", 'success');
    setTimeout(() => this.redirectToDashboard(), 1500);
  }

  async handleForgotPassword(e: Event): Promise<void> {
    e.preventDefault();

    const forgotEmailInput = document.getElementById("forgotEmail") as HTMLInputElement;
    const email = forgotEmailInput.value.trim();
    const errorElement = document.getElementById("forgotEmailError") as HTMLSpanElement;

    if (!email) {
      this.showFieldError(errorElement, "El correo electrónico es requerido");
      return;
    }

    const users = this.storageService.get("users") || [];
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      this.showFieldError(errorElement, "No encontramos una cuenta con este correo electrónico");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simular envío

    this.showNotification("Se han enviado las instrucciones a tu correo electrónico", 'success');
    this.hideForgotPassword();
  }

  validateForm(): boolean {
    let isValid = true;
    isValid = this.validateEmail() && isValid;
    isValid = this.validatePassword() && isValid;
    return isValid;
  }

  validateEmail(): boolean {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const email = emailInput.value.trim();
    const errorElement = document.getElementById("emailError") as HTMLSpanElement;

    if (!email) {
      this.showFieldError(errorElement, "El correo electrónico es requerido");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showFieldError(errorElement, "Ingresa un correo electrónico válido");
      return false;
    }

    this.clearFieldError(errorElement);
    return true;
  }

  validatePassword(): boolean {
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const password = passwordInput.value;
    const errorElement = document.getElementById("passwordError") as HTMLSpanElement;

    if (!password) {
      this.showFieldError(errorElement, "La contraseña es requerida");
      return false;
    }

    this.clearFieldError(errorElement);
    return true;
  }

  showFieldError(errorElement: HTMLElement, message: string): void {
    errorElement.textContent = message;
    (errorElement as HTMLSpanElement).style.display = 'block';
  }

  clearFieldError(errorElement: HTMLElement): void {
    errorElement.textContent = "";
    (errorElement as HTMLSpanElement).style.display = 'none';
  }

  // Unifica showSuccess y showError en una función de notificación
  showNotification(message: string, type: 'success' | 'error'): void {
    const notificationDiv = document.createElement("div");
    notificationDiv.className = type === 'success' ? "success-notification" : "error-notification";
    notificationDiv.innerHTML = `
      <div class="${type}-content">
          <span class="${type}-icon">${type === 'success' ? '✅' : '❌'}</span>
          <span class="${type}-text">${message}</span>
      </div>
    `;

    document.body.appendChild(notificationDiv);

    setTimeout(() => {
      notificationDiv.remove();
    }, type === 'success' ? 3000 : 5000);
  }

  setLoading(isLoading: boolean): void {
    const btn = document.getElementById("loginBtn") as HTMLButtonElement;
    if (btn) {
      if (isLoading) {
        btn.classList.add("loading");
        btn.disabled = true;
        (btn.querySelector('.btn-text') as HTMLElement).style.display = 'none';
        (btn.querySelector('.btn-loading') as HTMLElement).style.display = 'inline';
      } else {
        btn.classList.remove("loading");
        btn.disabled = false;
        (btn.querySelector('.btn-text') as HTMLElement).style.display = 'inline';
        (btn.querySelector('.btn-loading') as HTMLElement).style.display = 'none';
      }
    }
  }

  redirectToDashboard(): void {
    this.router.navigate(['/home']); // Redirige a /home
  }

  // --- Funciones globales adaptadas a métodos del componente ---
  togglePassword(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const button = input.nextElementSibling as HTMLButtonElement;

    if (input.type === "password") {
      input.type = "text";
      button.textContent = "🙈";
    } else {
      input.type = "password";
      button.textContent = "👁️";
    }
  }

  fillDemoCredentials(userType: 'admin' | 'student' | 'instructor'): void {
    const credentials = {
      admin: { email: "admin@courseconnect.com", password: "admin123" },
      student: { email: "estudiante@courseconnect.com", password: "student123" },
      instructor: { email: "instructor@courseconnect.com", password: "instructor123" },
    };

    const creds = credentials[userType];
    if (creds) {
      (document.getElementById("email") as HTMLInputElement).value = creds.email;
      (document.getElementById("password") as HTMLInputElement).value = creds.password;
    }
  }

  showForgotPassword(): void {
    this.showForgotPasswordModal = true;
  }

  hideForgotPassword(): void {
    this.showForgotPasswordModal = false;
    (document.getElementById("forgotPasswordForm") as HTMLFormElement).reset();
    this.clearFieldError(document.getElementById("forgotEmailError") as HTMLSpanElement);
  }
}