import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EmailVerificationService } from './email-verification';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmailVerificationService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('verifies an email token', () => {
    service.verifyEmail('secure-token').subscribe();

    const request = httpTesting.expectOne(
      (candidate) =>
        candidate.url === '/api/auth/verify-email' &&
        candidate.params.get('token') === 'secure-token',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ message: 'Email verified successfully', role: 'reader', account_status: 'active' });
  });

  it('requests a replacement verification link', () => {
    service.resendVerification('reader@example.com').subscribe();

    const request = httpTesting.expectOne('/api/auth/resend-verification');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'reader@example.com' });
    request.flush({ message: 'Verification email sent' });
  });
});
