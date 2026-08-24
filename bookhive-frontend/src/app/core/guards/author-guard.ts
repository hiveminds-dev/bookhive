import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authorGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return state?.url
      ? router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
      : router.createUrlTree(['/login']);
  }

  return auth.hasRole('author')
    ? true
    : router.createUrlTree([auth.getCurrentUserLandingRoute()]);
};
