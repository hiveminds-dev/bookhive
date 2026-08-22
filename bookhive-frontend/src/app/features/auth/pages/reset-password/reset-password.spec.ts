import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PasswordRecoveryService } from '../../services/password-recovery';
import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  let fixture: ComponentFixture<ResetPassword>;
  let component: ResetPassword;
  const passwordRecovery = {
    resetPassword: vi.fn(() => of({ message: 'Password reset successfully' })),
  };

  beforeEach(async () => {
    passwordRecovery.resetPassword.mockClear();
    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        provideRouter([]),
        { provide: PasswordRecoveryService, useValue: passwordRecovery },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ token: 'secure-reset-token-value' }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
  });

  it('submits matching passwords with the URL token', () => {
    component.resetForm.setValue({
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    });

    component.submit();

    expect(passwordRecovery.resetPassword).toHaveBeenCalledWith(
      'secure-reset-token-value',
      'NewPassword123!',
    );
    expect(component.resetComplete).toBe(true);
  });

  it('rejects mismatched passwords locally', () => {
    component.resetForm.setValue({
      password: 'NewPassword123!',
      confirmPassword: 'DifferentPassword123!',
    });

    component.submit();

    expect(component.errorMessage).toBe('Passwords do not match.');
    expect(passwordRecovery.resetPassword).not.toHaveBeenCalled();
  });
});
