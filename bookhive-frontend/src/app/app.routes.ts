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
  // AUTHENTICATION
  // ==========================================

  {
    path: 'login',

    loadComponent: () =>
      import(
        './features/auth/pages/login/login'
        ).then(
        module => module.Login
      )
  },

  {
    path: 'register',

    loadComponent: () =>
      import(
        './features/auth/pages/register/register'
        ).then(
        module => module.Register
      )
  },

  {
    path: 'forgot-password',

    loadComponent: () =>
      import(
        './features/auth/pages/forgot-password/forgot-password'
        ).then(
        module => module.ForgotPassword
      )
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
  // ==========================================

  {
    path: 'author',
    component: AuthorLayoutComponent,

    children: [

      // /author
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // /author/dashboard
      {
        path: 'dashboard',

        loadComponent: () =>
          import(
            './features/author/dashboard/dashboard'
            ).then(
            module =>
              module.AuthorDashboardComponent
          )
      },

      // /author/books
      {
        path: 'books',

        loadComponent: () =>
          import(
            './features/author/books/book-management/book-management'
            ).then(
            module =>
              module.BookManagementComponent
          )
      },

      // /author/books/upload
      {
        path: 'books/upload',

        loadComponent: () =>
          import(
            './features/author/books/edit-book/edit-book'
            ).then(
            module =>
              module.EditBookComponent
          )
      },

      // /author/books/edit/1
      {
        path: 'books/edit/:id',

        loadComponent: () =>
          import(
            './features/author/books/edit-book/edit-book'
            ).then(
            module =>
              module.EditBookComponent
          )
      },

      // /author/requests
      {
        path: 'requests',

        loadComponent: () =>
          import(
            './features/author/requests/requests'
            ).then(
            module =>
              module.RequestsComponent
          )
      }

    ]
  },

  // ==========================================
  // MAIN WEBSITE
  // ==========================================

  {
    path: '',
    component: MainLayoutComponent,

    children: [

      // /home
      {
        path: 'home',

        loadComponent: () =>
          import(
            './features/main/home/home'
            ).then(
            module => module.Home
          )
      },

      // /explore
      {
        path: 'explore',

        loadComponent: () =>
          import(
            './features/main/explore/explore'
            ).then(
            module =>
              module.ExploreComponent
          )
      },

      // /explore/1/preview
      {
        path: 'explore/:id/preview',

        loadComponent: () =>
          import(
            './features/main/book-preview/book-preview'
            ).then(
            module =>
              module.BookPreviewComponent
          )
      },

      // /book-reader/1
      {
        path: 'book-reader/:id',

        loadComponent: () =>
          import(
            './features/main/book-reader/book-reader'
            ).then(
            module =>
              module.BookReaderComponent
          )
      },

      // /community
      {
        path: 'community',

        loadComponent: () =>
          import(
            './features/main/community/community'
            ).then(
            module => module.Community
          )
      },

      // /about
      {
        path: 'about',

        loadComponent: () =>
          import(
            './features/main/about/about'
            ).then(
            module => module.About
          )
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
