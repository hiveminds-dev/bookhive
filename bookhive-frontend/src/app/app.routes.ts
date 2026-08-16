import { Routes } from '@angular/router';

import {
  VerifyEmail
} from './features/auth/pages/verify-email/verify-email';

import {
  VerificationSuccess
} from './features/auth/pages/verification-success/verification-success';

import {
  MainLayoutComponent
} from './layouts/main-layout/main-layout';

export const routes: Routes = [

  // ==========================================
  // DEFAULT
  // ==========================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // ==========================================
  // AUTHENTICATION PAGES
  // Navbar එක පෙන්වන්නේ නැහැ
  // ==========================================

  {
    path: 'login',

    loadComponent: () =>
      import('./features/auth/login/login')
        .then(module => module.Login)
  },

  {
    path: 'register',

    loadComponent: () =>
      import('./features/auth/register/register')
        .then(module => module.Register)
  },

  {
    path: 'forgot-password',

    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password')
        .then(module => module.ForgotPassword)
  },

  {
    path: 'auth/verify-email',
    component: VerifyEmail
  },

  {
    path: 'auth/verification-success',
    component: VerificationSuccess
  },

  // ==========================================
  // MAIN WEBSITE
  // Shared Navbar එක පෙන්වන pages
  // ==========================================

  {
    path: '',
    component: MainLayoutComponent,

    children: [

      // ---------------------------------------
      // Home
      // URL: /home
      // ---------------------------------------

      {
        path: 'home',

        loadComponent: () =>
          import('./features/main/home/home')
            .then(module => module.Home)
      },

      // ---------------------------------------
      // Explore Library
      // URL: /explore
      // ---------------------------------------

      {
        path: 'explore',

        loadComponent: () =>
          import('./features/main/explore/explore')
            .then(module => module.ExploreComponent)
      },

      // ---------------------------------------
      // Book Preview
      // URL: /explore/1/preview
      // ---------------------------------------

      {
        path: 'explore/:id/preview',

        loadComponent: () =>
          import(
            './features/main/book-preview/book-preview'
            )
            .then(module => module.BookPreviewComponent)
      },

      // ---------------------------------------
      // Book Reader
      // URL: /book-reader/1
      // ---------------------------------------

      {
        path: 'book-reader/:id',

        loadComponent: () =>
          import(
            './features/main/book-reader/book-reader'
            )
            .then(module => module.BookReaderComponent)
      },

      // ---------------------------------------
      // Community
      // URL: /community
      // ---------------------------------------

      {
        path: 'community',

        loadComponent: () =>
          import('./features/main/community/community')
            .then(module => module.Community)
      },

      // ---------------------------------------
      // About
      // URL: /about
      // ---------------------------------------

      {
        path: 'about',

        loadComponent: () =>
          import('./features/main/about/about')
            .then(module => module.About)
      }

    ]
  },

  // ==========================================
  // UNKNOWN URL
  // ==========================================

  {
    path: '**',
    redirectTo: 'login'
  }

];
