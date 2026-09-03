import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { routes } from './app.routes';
import { Auth } from './core/services/auth';
import { BookService } from './core/services/book.service';

describe('App Routing Behavior', () => {
  let harness: RouterTestingHarness;
  let router: Router;
  let mockAuth: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    getUserRole: ReturnType<typeof vi.fn>;
    hasRole: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let mockBookService: {
    getCatalogue: ReturnType<typeof vi.fn>;
    getCategories: ReturnType<typeof vi.fn>;
    getBookDetails: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAuth = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      getUserRole: vi.fn().mockReturnValue(null),
      hasRole: vi.fn().mockReturnValue(false),
      logout: vi.fn().mockReturnValue(of({ message: 'Logged out' })),
    };

    mockBookService = {
      getCatalogue: vi.fn().mockReturnValue(
        of({ total_items: 0, total_pages: 1, current_page: 1, page_size: 6, items: [] }),
      ),
      getCategories: vi.fn().mockReturnValue(
        of({ total: 0, page: 1, page_size: 10, items: [] }),
      ),
      getBookDetails: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        { provide: Auth, useValue: mockAuth },
        { provide: BookService, useValue: mockBookService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  it('should redirect "/" to "/home" and render public Home page', async () => {
    await harness.navigateByUrl('/');
    expect(router.url).toBe('/home');
  }, 15000);

  it('should allow direct access to "/home"', async () => {
    await harness.navigateByUrl('/home');
    expect(router.url).toBe('/home');
  });

  it('should allow access to public routes without authentication', async () => {
    mockAuth.isAuthenticated.mockReturnValue(false);

    await harness.navigateByUrl('/explore');
    expect(router.url).toBe('/explore');

    await harness.navigateByUrl('/about');
    expect(router.url).toBe('/about');

    await harness.navigateByUrl('/community');
    expect(router.url).toBe('/community');

    await harness.navigateByUrl('/login');
    expect(router.url).toBe('/login');

    await harness.navigateByUrl('/register');
    expect(router.url).toBe('/register');

    await harness.navigateByUrl('/forgot-password');
    expect(router.url).toBe('/forgot-password');
  });

  it('should redirect unauthenticated guest away from protected Reader profile route', async () => {
    mockAuth.isAuthenticated.mockReturnValue(false);
    mockAuth.getUserRole.mockReturnValue(null);

    await harness.navigateByUrl('/profile');
    expect(router.url).not.toBe('/profile');
  });

  it('should redirect unauthenticated guest away from protected Author Studio route', async () => {
    mockAuth.isAuthenticated.mockReturnValue(false);
    mockAuth.getUserRole.mockReturnValue(null);

    await harness.navigateByUrl('/author/dashboard');
    expect(router.url).toContain('/login');
  });

  it('should redirect unauthenticated guest away from protected Admin route', async () => {
    mockAuth.isAuthenticated.mockReturnValue(false);
    mockAuth.getUserRole.mockReturnValue(null);

    await harness.navigateByUrl('/admin/dashboard');
    expect(router.url).toContain('/login');
  });

  it('should redirect unknown routes to "/home"', async () => {
    await harness.navigateByUrl('/some/unknown/nonexistent/route');
    expect(router.url).toBe('/home');
  });
});
