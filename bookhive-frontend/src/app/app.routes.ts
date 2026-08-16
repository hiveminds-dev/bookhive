import { Routes } from '@angular/router';

import { VerificationSuccess } from './features/auth/pages/verification-success/verification-success';
import { VerifyEmail } from './features/auth/pages/verify-email/verify-email';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // Authentication pages without the shared navbar.
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((module) => module.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((module) => module.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password').then(
        (module) => module.ForgotPassword,
      ),
  },
  {
    path: 'auth/verify-email',
    component: VerifyEmail,
  },
  {
    path: 'auth/verification-success',
    component: VerificationSuccess,
  },

  // Main website pages rendered inside the shared layout.
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/main/home/home').then((module) => module.Home),
      },
      {
        path: 'explore',
        loadComponent: () =>
          import('./features/main/explore/explore').then((module) => module.ExploreComponent),
      },
      {
        path: 'explore/:id/preview',
        loadComponent: () =>
          import('./features/main/book-preview/book-preview').then(
            (module) => module.BookPreviewComponent,
          ),
      },
      {
        path: 'book-reader/:id',
        loadComponent: () =>
          import('./features/main/book-reader/book-reader').then(
            (module) => module.BookReaderComponent,
          ),
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./features/main/community/community').then((module) => module.Community),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/main/about/about').then((module) => module.About),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
