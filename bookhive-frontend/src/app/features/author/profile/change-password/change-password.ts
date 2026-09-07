import {
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  Auth
} from '../../../../core/services/auth';
import { extractErrorMessage } from '../../../../core/utils/error.utils';

function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const newPassword =
    control.get('newPassword')?.value;

  const confirmPassword =
    control.get('confirmPassword')?.value;

  if (
    !newPassword ||
    !confirmPassword
  ) {
    return null;
  }

  return newPassword === confirmPassword
    ? null
    : {
      passwordMismatch: true
    };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss'
})
export class ChangePassword {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  private readonly auth =
    inject(Auth);

  private readonly cdr =
    inject(ChangeDetectorRef);

  showCurrentPassword = false;

  showNewPassword = false;

  showConfirmPassword = false;

  isSaving = false;

  successMessage = '';

  errorMessage = '';

  readonly passwordForm =
    this.formBuilder.nonNullable.group(
      {
        currentPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8)
          ]
        ],

        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
            )
          ]
        ],

        confirmPassword: [
          '',
          [
            Validators.required
          ]
        ]
      },
      {
        validators:
        passwordsMatchValidator
      }
    );

  toggleCurrentPassword(): void {
    this.showCurrentPassword =
      !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword =
      !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword =
      !this.showConfirmPassword;
  }

  isInvalid(
    controlName:
      | 'currentPassword'
      | 'newPassword'
      | 'confirmPassword'
  ): boolean {
    const control =
      this.passwordForm.controls[
        controlName
        ];

    return (
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }

  get passwordsDoNotMatch(): boolean {
    const confirmControl =
      this.passwordForm.controls
        .confirmPassword;

    return (
      this.passwordForm.hasError(
        'passwordMismatch'
      ) &&
      (
        confirmControl.touched ||
        confirmControl.dirty
      )
    );
  }

  cancel(): void {
    this.router.navigate([
      '/author/profile'
    ]);
  }

  submitPassword(): void {
    if (
      this.passwordForm.invalid ||
      this.isSaving
    ) {
      this.passwordForm.markAllAsTouched();

      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const currentPassword =
      this.passwordForm.controls
        .currentPassword.value;

    const newPassword =
      this.passwordForm.controls
        .newPassword.value;

    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.successMessage =
          response?.message || 'Password changed successfully.';
        this.errorMessage = '';
        this.passwordForm.reset();
        this.cdr.markForCheck();

        setTimeout(() => {
          this.router.navigate([
            '/author/profile'
          ]);
        }, 1200);
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = extractErrorMessage(
          error,
          'Failed to change password. Please verify your current password and try again.'
        );
        this.cdr.markForCheck();
      }
    });
  }
}
