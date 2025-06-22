import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component'; // Importa Home
import { LoginComponent } from './pages/login/login.component'; // Importa Login

export const routes: Routes = [
  { path: '', component: HomeComponent }, // <-- NUEVO: La ruta raíz carga Home
  { path: 'login', component: LoginComponent }, // La ruta para el login (lo implementaremos luego)
  // Aquí añadirías otras rutas para tus otras páginas (ej. 'cursos', 'registro', etc.)
  // { path: 'cursos', component: CursosComponent },
  // { path: 'registro', component: RegistroComponent },
  { path: '**', redirectTo: '' } // Opcional: Redirige rutas no encontradas a la página de inicio
];