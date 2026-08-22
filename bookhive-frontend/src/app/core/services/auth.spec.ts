import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('stores a persistent login session when remember me is selected', () => {
    service.login({ email: 'reader@example.com', password: 'password' }, true).subscribe();

    const request = httpTesting.expectOne('/api/auth/login');
    request.flush({
      access_token: 'jwt-token',
      token_type: 'bearer',
      expires_in: 1800,
      user: {
        id: 1,
        full_name: 'Reader',
        username: 'reader',
        email: 'reader@example.com',
        role: 'reader',
        account_status: 'active',
        email_verified: true,
      },
    });

    expect(localStorage.getItem('bookhive_access_token')).toBe('jwt-token');
    expect(service.hasRole('reader')).toBe(true);
  });

  it('clears the stored session on logout', () => {
    localStorage.setItem('bookhive_access_token', 'jwt-token');
    service.logout().subscribe();

    const request = httpTesting.expectOne('/api/auth/logout');
    expect(request.request.method).toBe('POST');
    request.flush(null);

    expect(service.getAccessToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('clears the local session even when the logout request fails', () => {
    sessionStorage.setItem('bookhive_access_token', 'jwt-token');
    service.logout().subscribe({ error: () => undefined });

    const request = httpTesting.expectOne('/api/auth/logout');
    request.flush('Server error', { status: 500, statusText: 'Server Error' });

    expect(service.getAccessToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
