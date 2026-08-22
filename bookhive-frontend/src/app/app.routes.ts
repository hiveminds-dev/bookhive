import {
  Routes
} from '@angular/router';

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

import {
  adminGuard
} from './core/guards/admin-guard';

import {
  authorGuard
} from './core/guards/author-guard';

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
        module =>
          module.Login
      )
  },

  {
    path: 'register',

    loadComponent: () =>
      import(
        './features/auth/pages/register/register'
        ).then(
        module =>
          module.Register
      )
  },

  {
    path: 'forgot-password',

    loadComponent: () =>
      import(
        './features/auth/pages/forgot-password/forgot-password'
        ).then(
        module =>
          module.ForgotPassword
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

  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./features/auth/pages/reset-password/reset-password').then(
        module => module.ResetPassword
      )
  },

  // ==========================================
  // AUTHOR STUDIO
  // ==========================================

  {
    path: 'author',
    component: AuthorLayoutComponent,
    canActivate: [
      authorGuard
    ],

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
      },

      // /author/analytics
      {
        path: 'analytics',

        loadComponent: () =>
          import(
            './features/author/analytics/analytics'
            ).then(
            module =>
              module.AnalyticsComponent
          )
      },

      // /author/profile/edit
      {
        path: 'profile/edit',

        loadComponent: () =>
          import(
            './features/author/profile/edit-profile/edit-profile'
            ).then(
            module =>
              module.EditProfile
          )
      },

      // /author/profile/change-password
      {
        path: 'profile/change-password',

        loadComponent: () =>
          import(
            './features/author/profile/change-password/change-password'
            ).then(
            module =>
              module.ChangePassword
          )
      },

      // /author/profile
      {
        path: 'profile',

        loadComponent: () =>
          import(
            './features/author/profile/profile'
            ).then(
            module =>
              module.Profile
          )
      }

    ]
  },

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [
      adminGuard
    ],

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',

        loadComponent: () =>
          import(
            './features/admin/dashboard/dashboard'
            ).then(
            module =>
              module.Dashboard
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
      {
        path: 'home',

        loadComponent: () =>
          import(
            './features/main/home/home'
            ).then(
            module =>
              module.Home
          )
      },
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
      {
        path: 'community',

        loadComponent: () =>
          import(
            './features/main/community/community'
            ).then(
            module =>
              module.Community
          )
      },
      {
        path: 'about',

        loadComponent: () =>
          import(
            './features/main/about/about'
            ).then(
            module =>
              module.About
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
