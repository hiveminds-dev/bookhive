import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Auth } from '../services/auth';
import { authorGuard } from './author-guard';

describe('authorGuard', () => {
  const loginTree = {} as UrlTree;
  const homeTree = {} as UrlTree;
  const adminDashboardTree = {} as UrlTree;

  let auth: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    hasRole: ReturnType<typeof vi.fn>;
    getCurrentUserLandingRoute: ReturnType<typeof vi.fn>;
  };
  let router: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = {
      isAuthenticated: vi.fn(),
      hasRole: vi.fn(),
      getCurrentUserLandingRoute: vi.fn().mockReturnValue('/home'),
    };
    router = {
      createUrlTree: vi.fn().mockImplementation((commands: string[]) => {
        if (commands[0] === '/login') return loginTree;
        if (commands[0] === '/home') return homeTree;
        if (commands[0] === '/admin/dashboard') return adminDashboardTree;
        return {} as UrlTree;
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  function executeGuard(stateUrl?: string) {
    const mockState = stateUrl ? ({ url: stateUrl } as RouterStateSnapshot) : ({} as RouterStateSnapshot);
    return TestBed.runInInjectionContext(() =>
      authorGuard({} as never, mockState),
    );
  }

  it('redirects unauthenticated users to login with returnUrl', () => {
    auth.isAuthenticated.mockReturnValue(false);

    expect(executeGuard('/author/dashboard')).toBe(loginTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/author/dashboard' },
    });
  });

  it('redirects unauthenticated users to login without returnUrl if state has no url', () => {
    auth.isAuthenticated.mockReturnValue(false);

    expect(executeGuard()).toBe(loginTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('allows an authenticated author', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockReturnValue(true);

    expect(executeGuard('/author/dashboard')).toBe(true);
    expect(auth.hasRole).toHaveBeenCalledWith('author');
  });

  it('redirects a reader user to /home', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);
    auth.getCurrentUserLandingRoute.mockReturnValue('/home');

    expect(executeGuard('/author/dashboard')).toBe(homeTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/home']);
  });

  it('redirects an admin user to /admin/dashboard', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);
    auth.getCurrentUserLandingRoute.mockReturnValue('/admin/dashboard');

    expect(executeGuard('/author/books')).toBe(adminDashboardTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('redirects a super admin user to /admin/dashboard', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);
    auth.getCurrentUserLandingRoute.mockReturnValue('/admin/dashboard');

    expect(executeGuard('/author/profile')).toBe(adminDashboardTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/dashboard']);
  });
});
