import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { Storage } from '../services/storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Storage).get('bookhive_access_token');
  if (!token || req.url.endsWith('/auth/login')) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
