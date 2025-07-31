import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PanelComponent } from './pages/panel/panel.component';
import { CoursesComponent } from './pages/courses/courses.component'; 
import { AulaComponent } from './pages/aula/aula.component';
import { CronogramaComponent } from './pages/cronograma/cronograma.component'; // <-- Importa el CronogramaComponent

// Importa los guardianes de ruta
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent 
  },
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [publicGuard] 
  },
  { 
    path: 'register', 
    component: RegisterComponent, 
    canActivate: [publicGuard] 
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'panel', 
    component: PanelComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'courses', 
    component: CoursesComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'aula/:courseId', 
    component: AulaComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'cronograma', 
    component: CronogramaComponent,
    canActivate: [authGuard] 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
