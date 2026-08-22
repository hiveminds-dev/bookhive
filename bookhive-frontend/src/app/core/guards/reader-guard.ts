import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '../services/auth';

export const readerGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  return auth.hasRole('reader')
    ? true
    : router.createUrlTree([auth.getCurrentUserLandingRoute()]);
};
