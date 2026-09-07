import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { Storage } from '../services/storage';

const ACCESS_TOKEN_KEY = 'bookhive_access_token';
const AUTH_USER_KEY = 'bookhive_auth_user';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(Storage);
  const router = inject(Router);
  const token = storage.get(ACCESS_TOKEN_KEY);
  if (!token || req.url.endsWith('/auth/login')) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  ).pipe(
    catchError((error) => {
      if (error?.status === 401) {
        storage.remove(ACCESS_TOKEN_KEY);
        storage.remove(AUTH_USER_KEY);
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }

      return throwError(() => error);
    }),
  );
};
