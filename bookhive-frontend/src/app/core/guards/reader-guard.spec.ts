import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { Auth } from '../services/auth';
import { readerGuard } from './reader-guard';

describe('readerGuard', () => {
  const loginTree = {} as UrlTree;
  const homeTree = {} as UrlTree;
  let auth: { isAuthenticated: ReturnType<typeof vi.fn>; hasRole: ReturnType<typeof vi.fn> };
  let router: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = {
      isAuthenticated: vi.fn(),
      hasRole: vi.fn(),
    };
    router = {
      createUrlTree: vi.fn().mockImplementation((commands: string[]) =>
        commands[0] === '/login' ? loginTree : homeTree,
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
      readerGuard({} as never, {} as never),
    );
  }

  it('redirects anonymous users to login', () => {
    auth.isAuthenticated.mockReturnValue(false);

    expect(executeGuard()).toBe(loginTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('allows an authenticated reader', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockReturnValue(true);

    expect(executeGuard()).toBe(true);
    expect(auth.hasRole).toHaveBeenCalledWith('reader');
  });

  it('redirects a different role to the public home page', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);

    expect(executeGuard()).toBe(homeTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/home']);
  });
});
