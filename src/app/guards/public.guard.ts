import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        // Si hay un usuario, redirigir a la página principal y bloquear el acceso
        router.navigate(['/']);
        return false;
      }
      // Si no hay usuario, permitir el acceso a la página de login/registro
      return true;
    })
  );
};