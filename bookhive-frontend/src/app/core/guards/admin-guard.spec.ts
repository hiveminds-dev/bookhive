import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { Auth } from '../services/auth';
import { adminGuard } from './admin-guard';

describe('adminGuard', () => {
  const loginTree = {} as UrlTree;
  const landingTree = {} as UrlTree;
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
      getCurrentUserLandingRoute: vi.fn().mockReturnValue('/author/dashboard'),
    };
    router = {
      createUrlTree: vi.fn().mockImplementation((commands: string[]) =>
        commands[0] === '/login' ? loginTree : landingTree,
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  function executeGuard() {
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as never, {} as never),
    );
  }

  it('redirects anonymous users to login', () => {
    auth.isAuthenticated.mockReturnValue(false);

    expect(executeGuard()).toBe(loginTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('allows an authenticated admin', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockImplementation((role: string) => role === 'admin');

    expect(executeGuard()).toBe(true);
    expect(auth.hasRole).toHaveBeenCalledWith('admin');
  });

  it('allows an authenticated super admin', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockImplementation((role: string) => role === 'super_admin');

    expect(executeGuard()).toBe(true);
    expect(auth.hasRole).toHaveBeenCalledWith('super_admin');
  });

  it('redirects a different role to that user landing page', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);

    expect(executeGuard()).toBe(landingTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/author/dashboard']);
  });
});
