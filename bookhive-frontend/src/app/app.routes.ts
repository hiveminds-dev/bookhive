import { Routes } from '@angular/router';
import { VerifyEmail } from './features/auth/pages/verify-email/verify-email';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register')
        .then(m => m.Register)
  },

  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password')
        .then(m => m.ForgotPassword)
  },

  {
    path: 'auth/verify-email',
    component: VerifyEmail
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];
