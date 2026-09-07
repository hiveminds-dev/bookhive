import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter,
  Router
} from '@angular/router';

import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  Auth
} from '../../../../core/services/auth';

import {
  ChangePassword
} from './change-password';

describe(
  'ChangePassword',
  () => {

    let component: ChangePassword;
    let fixture: ComponentFixture<ChangePassword>;
    let mockAuth: { changePassword: ReturnType<typeof vi.fn> };
    let router: Router;

    beforeEach(async () => {
      mockAuth = {
        changePassword: vi.fn().mockReturnValue(of({ message: 'Password changed successfully.' }))
      };

      await TestBed.configureTestingModule({
        imports: [
          ChangePassword
        ],
        providers: [
          provideRouter([]),
          { provide: Auth, useValue: mockAuth }
        ]
      }).compileComponents();

      router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

      fixture =
        TestBed.createComponent(
          ChangePassword
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should start with invalid form',
      () => {
        expect(component.passwordForm.invalid)
          .toBe(true);
      }
    );

    it(
      'should detect mismatched passwords',
      () => {
        component.passwordForm.patchValue({
          currentPassword:
            'Current123',
          newPassword:
            'NewPassword123',
          confirmPassword:
            'DifferentPassword123'
        });

        expect(
          component.passwordForm.hasError(
            'passwordMismatch'
          )
        ).toBe(true);
      }
    );

    it(
      'should accept matching passwords',
      () => {
        component.passwordForm.patchValue({
          currentPassword:
            'Current123',
          newPassword:
            'NewPassword123',
          confirmPassword:
            'NewPassword123'
        });

        expect(component.passwordForm.valid)
          .toBe(true);
      }
    );

    it('should call auth.changePassword when valid form is submitted', () => {
      component.passwordForm.patchValue({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

      component.submitPassword();

      expect(mockAuth.changePassword).toHaveBeenCalledWith('Password123!', 'NewPassword123!');
      expect(component.successMessage).toBe('Password changed successfully.');
      expect(component.isSaving).toBe(false);
    });

    it('should set errorMessage when auth.changePassword fails', () => {
      mockAuth.changePassword.mockReturnValue(
        throwError(() => ({
          error: { detail: 'Incorrect current password' }
        }))
      );

      component.passwordForm.patchValue({
        currentPassword: 'WrongPassword!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

      component.submitPassword();

      expect(mockAuth.changePassword).toHaveBeenCalledWith('WrongPassword!', 'NewPassword123!');
      expect(component.errorMessage).toBe('Incorrect current password');
      expect(component.isSaving).toBe(false);
    });

    it('should extract validation messages and not show [object Object] on 422 error', () => {
      mockAuth.changePassword.mockReturnValue(
        throwError(() => ({
          status: 422,
          error: {
            detail: [
              { loc: ['body', 'new_password'], msg: 'Password must have at least 8 characters' }
            ]
          }
        }))
      );

      component.passwordForm.patchValue({
        currentPassword: 'Current123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

      component.submitPassword();

      expect(component.errorMessage).toBe('Password must have at least 8 characters');
      expect(component.errorMessage).not.toContain('[object Object]');
    });
  }
);

