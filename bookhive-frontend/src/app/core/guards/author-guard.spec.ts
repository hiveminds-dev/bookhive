import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { Auth } from '../services/auth';
import { authorGuard } from './author-guard';

describe('authorGuard', () => {
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
      getCurrentUserLandingRoute: vi.fn().mockReturnValue('/admin/dashboard'),
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
      authorGuard({} as never, {} as never),
    );
  }

  it('redirects anonymous users to login', () => {
    auth.isAuthenticated.mockReturnValue(false);

    expect(executeGuard()).toBe(loginTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('allows an authenticated author', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockReturnValue(true);

    expect(executeGuard()).toBe(true);
    expect(auth.hasRole).toHaveBeenCalledWith('author');
  });

  it('redirects a different role to that user landing page', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);

    expect(executeGuard()).toBe(landingTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/dashboard']);
  });
});
