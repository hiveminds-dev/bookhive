import { CanActivateFn } from '@angular/router';

export const authorGuard: CanActivateFn = (route, state) => {
  return true;
};
