import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service'; // Ajusta la ruta

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  loginError: string | null = null;
  
  // Propiedades para el modal y el toggle de contraseña
  showPassword = false;
  showForgotPasswordModal = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializamos el formulario de login con validadores
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // Método para el envío del formulario principal
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marca todos los campos como 'tocados' para mostrar errores
      return;
    }

    this.isLoading = true;
    this.loginError = null;
    
    try {
      const { email, password } = this.loginForm.value;
      await this.authService.loginWithCredentials(email, password);
      this.router.navigate(['/']); // Redirigir a home si el login es exitoso
    } catch (error: any) {
      this.loginError = error.message; // Muestra el error en el template
    } finally {
      this.isLoading = false;
    }
  }

  // Método para los botones de inicio de sesión rápido
  quickLogin(role: 'Admin' | 'Estudiante' | 'Instructor'): void {
    let userToLogin: User | null = null;

    if (role === 'Admin') {
      userToLogin = { fullName: 'Administrador Demo', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=admin' };
    } else if (role === 'Estudiante') {
      userToLogin = { fullName: 'Estudiante de Prueba', role: 'Estudiante', avatar: 'https://i.pravatar.cc/150?u=student' };
    } else if (role === 'Instructor') {
      userToLogin = { fullName: 'Instructor Pro', role: 'Instructor', avatar: 'https://i.pravatar.cc/150?u=instructor' };
    }
    
    if (userToLogin) {
      this.authService.login(userToLogin);
      this.router.navigate(['/']);
    }
  }

  // Método para mostrar/ocultar la contraseña
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  
  // Lógica futura para el modal de "Olvidé mi contraseña"
  toggleForgotPasswordModal(show: boolean): void {
      this.showForgotPasswordModal = show;
  }
}