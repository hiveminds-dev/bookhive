import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';

import { Auth } from '../../core/services/auth';
import { AuthenticatedUser } from '../../features/auth/models/login';
import { MainLayoutComponent } from './main-layout';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let router: Router;
  let mockAuth: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    hasRole: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal<AuthenticatedUser | null>>;
  };

  beforeEach(async () => {
    mockAuth = {
      isAuthenticated: vi.fn(() => false),
      hasRole: vi.fn(() => false),
      logout: vi.fn(),
      currentUser: signal<AuthenticatedUser | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: mockAuth },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the official BookHive logo image with accessible alt text in header and footer', () => {
    const headerLogo: HTMLImageElement | null = fixture.nativeElement.querySelector('.site-header .brand-logo-img');
    expect(headerLogo).not.toBeNull();
    expect(headerLogo?.getAttribute('src')).toBe('images/assets/bookhive-logo.v2.png');
    expect(headerLogo?.getAttribute('alt')).toBe('BookHive');

    const brandLink: HTMLAnchorElement | null = fixture.nativeElement.querySelector('.site-header .brand');
    expect(brandLink?.getAttribute('href')).toBe('/home');

    const footerLogo: HTMLImageElement | null = fixture.nativeElement.querySelector('.site-footer .footer-logo-img');
    expect(footerLogo).not.toBeNull();
    expect(footerLogo?.getAttribute('src')).toBe('images/assets/bookhive-logo.v2.png');
    expect(footerLogo?.getAttribute('alt')).toBe('BookHive');
  });

  it('should open and close the mobile navigation', () => {
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen).toBe(true);

    component.closeMobileMenu();
    expect(component.mobileMenuOpen).toBe(false);
  });

  it('should navigate to explore with search parameter on searchBooks', () => {
    component.searchTerm = 'Algorithms';
    component.searchBooks();

    expect(router.navigate).toHaveBeenCalledWith(['/explore'], {
      queryParams: { search: 'Algorithms' },
      queryParamsHandling: 'merge',
    });
  });

  it('should show upload button only when user has author role', () => {
    expect(mockAuth.hasRole.mock.results.length >= 0).toBe(true);
    expect(fixture.nativeElement.querySelector('.btn-upload')).toBeNull();

    mockAuth.hasRole.mockImplementation((role: string) => role === 'author');
    mockAuth.isAuthenticated.mockReturnValue(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.btn-upload')).not.toBeNull();
  });
});
