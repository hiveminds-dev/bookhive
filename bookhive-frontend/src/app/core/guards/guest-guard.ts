import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '../services/auth';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);

  return auth.isAuthenticated()
    ? inject(Router).createUrlTree([auth.getCurrentUserLandingRoute()])
    : true;
};
