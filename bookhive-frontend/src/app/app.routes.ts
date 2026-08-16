import { Routes } from '@angular/router';

import { VerifyEmail } from './features/auth/pages/verify-email/verify-email';
import { VerificationSuccess } from './features/auth/pages/verification-success/verification-success';

export const routes: Routes = [
  // Default
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // Login
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },

  // Register
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register/register').then((m) => m.Register),
  },

  // Forgot Password
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },

  // Verify Email
  {
    path: 'auth/verify-email',
    component: VerifyEmail,
  },

  // Verification Success
  {
    path: 'auth/verification-success',
    component: VerificationSuccess,
  },

  // Unknown URL
  {
    path: '**',
    redirectTo: 'login',
  },
];
