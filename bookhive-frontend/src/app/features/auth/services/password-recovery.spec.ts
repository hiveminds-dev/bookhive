import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PasswordRecoveryService } from './password-recovery';

describe('PasswordRecoveryService', () => {
  let service: PasswordRecoveryService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PasswordRecoveryService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('requests a reset link without exposing account existence', () => {
    service.requestReset('reader@example.com').subscribe();

    const request = httpTesting.expectOne('/api/auth/forgot-password');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'reader@example.com' });
    request.flush({ message: 'If an account exists, a link has been sent.' });
  });

  it('submits the reset token and new password', () => {
    service.resetPassword('secure-reset-token', 'NewPassword123!').subscribe();

    const request = httpTesting.expectOne('/api/auth/reset-password');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      token: 'secure-reset-token',
      new_password: 'NewPassword123!',
    });
    request.flush({ message: 'Password reset successfully' });
  });
});
