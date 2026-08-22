import {
  Component,
  inject
} from '@angular/core';

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

  showCurrentPassword = false;

  showNewPassword = false;

  showConfirmPassword = false;

  isSaving = false;

  successMessage = '';

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

    const passwordData = {
      currentPassword:
      this.passwordForm.controls
        .currentPassword.value,

      newPassword:
      this.passwordForm.controls
        .newPassword.value
    };

    // connect backend api
    console.log(
      'Password data ready for backend:',
      passwordData
    );

    setTimeout(() => {
      this.isSaving = false;

      this.successMessage =
        'Password changed successfully.';

      this.passwordForm.reset();

      setTimeout(() => {
        this.router.navigate([
          '/author/profile'
        ]);
      }, 900);
    }, 1000);
  }
}
