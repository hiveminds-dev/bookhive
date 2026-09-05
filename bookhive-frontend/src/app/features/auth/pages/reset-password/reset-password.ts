import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PasswordRecoveryService } from '../../services/password-recovery';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly passwordRecovery = inject(PasswordRecoveryService);

  readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  isSubmitting = false;
  resetComplete = false;
  errorMessage: string | null = null;

  readonly resetForm = this.formBuilder.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  submit(): void {
    this.resetForm.markAllAsTouched();
    this.errorMessage = null;

    const password = this.resetForm.controls.password.value ?? '';
    const confirmation = this.resetForm.controls.confirmPassword.value ?? '';
    if (!this.token) {
      this.errorMessage = 'This password reset link is invalid.';
      return;
    }
    if (this.resetForm.invalid) {
      return;
    }
    if (password !== confirmation) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;
    this.passwordRecovery
      .resetPassword(this.token, password)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => (this.resetComplete = true),
        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            error.status === 400
              ? 'This password reset link is invalid, expired, or already used.'
              : error.status === 0
                ? 'Unable to connect to the BookHive server.'
                : 'Unable to reset your password. Please try again.';
        },
      });
  }
}
