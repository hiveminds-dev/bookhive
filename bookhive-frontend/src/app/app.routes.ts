import { Routes } from '@angular/router';

import {
  VerificationSuccess
} from './features/auth/pages/verification-success/verification-success';

import {
  VerifyEmail
} from './features/auth/pages/verify-email/verify-email';

import {
  MainLayoutComponent
} from './layouts/main-layout/main-layout';

import {
  AuthorLayoutComponent
} from './layouts/author-layout/author-layout';

import {
  AdminLayout
} from './layouts/admin-layout/admin-layout';
import { adminGuard } from './core/guards/admin-guard';
import { authorGuard } from './core/guards/author-guard';

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
  // Shared navbar නැහැ
  // ==========================================

  {
    path: 'login',

    loadComponent: () =>
      import('./features/auth/pages/login/login')
        .then(module => module.Login)
  },

  {
    path: 'register',

    loadComponent: () =>
      import('./features/auth/pages/register/register')
        .then(module => module.Register)
  },

  {
    path: 'forgot-password',

    loadComponent: () =>
      import(
        './features/auth/pages/forgot-password/forgot-password'
        )
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
  // AUTHOR STUDIO
  // Author sidebar සහ header එක සමඟ
  // ==========================================

  {
    path: 'author',
    component: AuthorLayoutComponent,
    canActivate: [authorGuard],

    children: [

      // /author open කළාම Dashboard එකට යනවා
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // Author Dashboard
      // URL: /author/dashboard
      {
        path: 'dashboard',

        loadComponent: () =>
          import(
            './features/author/dashboard/dashboard'
            )
            .then(
              module => module.AuthorDashboardComponent
            )
      }

      /*
       * අනෙක් Author pages හදන විට
       * මෙතැනට routes එකතු කරනවා:
       *
       * /author/books
       * /author/books/upload
       * /author/requests
       * /author/analytics
       * /author/profile
       */
    ]
  },

  // ==========================================
  // ADMIN DASHBOARD
  // Admin sidebar සහ header එක සමඟ
  // ==========================================

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',

        loadComponent: () =>
          import('./features/admin/dashboard/dashboard')
            .then(module => module.Dashboard)
      }
    ]
  },

  // ==========================================
  // MAIN WEBSITE
  // Shared main navbar එක සමඟ
  // ==========================================

  {
    path: '',
    component: MainLayoutComponent,

    children: [

      // Home
      {
        path: 'home',

        loadComponent: () =>
          import('./features/main/home/home')
            .then(module => module.Home)
      },

      // Explore Library
      {
        path: 'explore',

        loadComponent: () =>
          import('./features/main/explore/explore')
            .then(module => module.ExploreComponent)
      },

      // Book Preview
      {
        path: 'explore/:id/preview',

        loadComponent: () =>
          import(
            './features/main/book-preview/book-preview'
            )
            .then(
              module => module.BookPreviewComponent
            )
      },

      // Book Reader
      {
        path: 'book-reader/:id',

        loadComponent: () =>
          import(
            './features/main/book-reader/book-reader'
            )
            .then(
              module => module.BookReaderComponent
            )
      },

      // Community
      {
        path: 'community',

        loadComponent: () =>
          import('./features/main/community/community')
            .then(module => module.Community)
      },

      // About
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
