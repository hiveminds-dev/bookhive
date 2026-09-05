import {
  Routes
} from '@angular/router';

import {
  adminGuard
} from './core/guards/admin-guard';

import {
  authorGuard
} from './core/guards/author-guard';

import {
  readerGuard
} from './core/guards/reader-guard';

export const routes: Routes = [

  // ==========================================
  // DEFAULT
  // ==========================================

  {
    path: '',
    redirectTo: 'home',
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
    loadComponent: () =>
      import('./features/auth/pages/verify-email/verify-email').then(
        module => module.VerifyEmail
      )
  },

  {
    path: 'auth/verification-success',
    loadComponent: () =>
      import('./features/auth/pages/verification-success/verification-success').then(
        module => module.VerificationSuccess
      )
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
    loadComponent: () =>
      import('./layouts/author-layout/author-layout').then(
        module => module.AuthorLayoutComponent
      ),
    canActivate: [
      authorGuard
    ],
    canActivateChild: [
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
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(
        module => module.AdminLayout
      ),
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
      },
      {
        path: 'books',

        loadComponent: () =>
          import(
            './features/admin/books/book-management/book-management'
            ).then(
            module =>
              module.BookManagement
          )
      },
      {
        path: 'books/upload',

        loadComponent: () =>
          import(
            './features/admin/books/upload-book/upload-book'
            ).then(
            module =>
              module.UploadBookComponent
          )
      },
      {
        path: 'publish-book',

        loadComponent: () =>
          import(
            './features/admin/publish-book/publish-book'
            ).then(
            module =>
              module.PublishBookComponent
          )
      },
      {
        path: 'books/:id/review',

        loadComponent: () =>
          import(
            './features/admin/books/book-review/book-review'
            ).then(
            module =>
              module.BookReviewComponent
          )
      },
      {
        path: 'categories',

        loadComponent: () =>
          import(
            './features/admin/categories/categories'
            ).then(
            module =>
              module.CategoriesComponent
          )
      },
      {
        path: 'readers/:id',

        loadComponent: () =>
          import(
            './features/admin/readers/reader-detail/reader-detail'
            ).then(
            module =>
              module.ReaderDetailComponent
          )
      },
      {
        path: 'authors/:id',

        loadComponent: () =>
          import(
            './features/admin/authors/author-detail/author-detail'
            ).then(
            module =>
              module.AuthorDetailComponent
          )
      },
      {
        path: 'support',

        loadComponent: () =>
          import(
            './features/admin/support/support'
            ).then(
            module =>
              module.SupportComponent
          )
      },
      {
        path: 'authors',

        loadComponent: () =>
          import(
            './features/admin/authors/authors'
            ).then(
            module =>
              module.AuthorsComponent
          )
      },
      {
        path: 'community',

        loadComponent: () =>
          import(
            './features/admin/community/community'
            ).then(
            module =>
              module.Community
          )
      },
      {
        path: 'statistics',

        loadComponent: () =>
          import(
            './features/admin/statistics/statistics'
            ).then(
            module =>
              module.AdminStatisticsComponent
          )
      },
      {
        path: 'profile',

        loadComponent: () =>
          import(
            './features/admin/profile/profile'
            ).then(
            module =>
              module.AdminProfile
          )
      },
      {
        path: 'admins',

        loadComponent: () =>
          import(
            './features/admin/admin-management/admin-management'
            ).then(
            module =>
              module.AdminManagementComponent
          )
      }
    ]
  },

  // ==========================================
  // MAIN WEBSITE
  // ==========================================

  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout').then(
        module => module.MainLayoutComponent
      ),

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
        path: 'profile',
        canActivate: [
          readerGuard
        ],

        loadComponent: () =>
          import(
            './features/main/profile/profile'
            ).then(
            module =>
              module.ReaderProfile
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
    redirectTo: 'home'
  }

];
