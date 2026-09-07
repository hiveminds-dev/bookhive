import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { vi } from 'vitest';

import { Auth } from '../services/auth';
import { guestGuard } from './guest-guard';

describe('guestGuard', () => {
  const landingTree = {} as UrlTree;
  let auth: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    getCurrentUserLandingRoute: ReturnType<typeof vi.fn>;
  };
  let router: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => guestGuard(...guardParameters));

  beforeEach(() => {
    auth = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      getCurrentUserLandingRoute: vi.fn().mockReturnValue('/home'),
    };
    router = {
      createUrlTree: vi.fn().mockReturnValue(landingTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows anonymous users to access auth pages', () => {
    expect(executeGuard({} as never, {} as never)).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects authenticated users to their landing route', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.getCurrentUserLandingRoute.mockReturnValue('/author/dashboard');

    expect(executeGuard({} as never, {} as never)).toBe(landingTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/author/dashboard']);
  });
});
