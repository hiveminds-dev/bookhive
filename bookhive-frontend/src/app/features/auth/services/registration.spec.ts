import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  AuthorRegistrationRequest,
  AuthorRegistrationResult,
  ReaderRegistrationRequest,
  ReaderRegistrationResponse,
} from '../models/registration';
import { RegistrationService } from './registration';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RegistrationService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('registers a reader through the reader endpoint', () => {
    const request: ReaderRegistrationRequest = {
      full_name: 'John Doe',
      username: 'john_reads',
      email: 'john@example.com',
      password: 'SecurePass123!',
    };
    const response: ReaderRegistrationResponse = {
      id: 1,
      full_name: request.full_name,
      username: request.username,
      email: request.email,
      role: 'reader',
      account_status: 'inactive',
      email_verified: false,
      created_at: '2026-08-17T10:00:00Z',
    };

    service.registerReader(request).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const httpRequest = httpTesting.expectOne('/api/users/register');
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    httpRequest.flush(response);
  });

  it('registers an author through the author endpoint', () => {
    const request: AuthorRegistrationRequest = {
      full_name: 'Jane Smith',
      username: 'js_archer',
      email: 'jane@example.com',
      password: 'SecurePass123!',
      pen_name: 'J. S. Archer',
      country: 'Sri Lanka',
      preferred_language: 'English',
      short_bio: 'Independent fiction author.',
    };
    const response: AuthorRegistrationResult = {
      message: 'Author registration submitted successfully',
      data: {
        id: 2,
        author_profile_id: 1,
        full_name: request.full_name,
        username: request.username,
        email: request.email,
        role: 'author',
        account_status: 'pending',
        email_verified: false,
        pen_name: request.pen_name,
        country: request.country,
        preferred_language: request.preferred_language,
        short_bio: request.short_bio,
        profile_image_path: null,
        created_at: '2026-08-17T10:00:00Z',
      },
    };

    service.registerAuthor(request).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const httpRequest = httpTesting.expectOne('/api/authors/register');
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    httpRequest.flush(response);
  });

  it('checks email availability via GET /api/auth/check-email', () => {
    const email = 'check@example.com';
    const mockResponse = { available: true, message: null };

    service.checkEmailAvailability(email).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    const httpRequest = httpTesting.expectOne((req) =>
      req.url === '/api/auth/check-email' && req.params.get('email') === email
    );
    expect(httpRequest.request.method).toBe('GET');
    httpRequest.flush(mockResponse);
  });
});
