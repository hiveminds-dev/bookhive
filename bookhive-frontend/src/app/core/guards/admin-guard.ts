import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  if (!auth.isAuthenticated()) {
    return inject(Router).createUrlTree(['/login']);
  }
  return auth.hasRole('admin') ? true : inject(Router).createUrlTree(['/home']);
};
