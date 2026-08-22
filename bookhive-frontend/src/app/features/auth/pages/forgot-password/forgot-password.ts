import { Component, inject, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideCheck,
  LucideLockKeyhole,
  LucideMail,
  LucideShieldCheck,
  LucideSparkles,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import { PasswordRecoveryService } from '../../services/password-recovery';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideArrowLeft,
    LucideArrowRight,
    LucideCheck,
    LucideLockKeyhole,
    LucideMail,
    LucideShieldCheck,
    LucideSparkles,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword implements OnDestroy {
  private fb = inject(FormBuilder);
  private readonly passwordRecovery = inject(PasswordRecoveryService);

  readonly appName = 'BookHive';
  readonly logoPath = 'assets/bookhive-logo.png';

  isSubmitting = false;
  emailSent = false;
  requestError: string | null = null;

  submittedEmail = '';

  resendCooldown = 0;

  private cooldownTimer?: ReturnType<typeof setInterval>;

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  hasEmailError(): boolean {
    const email = this.forgotForm.controls.email;

    return (email.touched || email.dirty) && email.invalid;
  }

  isEmailValid(): boolean {
    const email = this.forgotForm.controls.email;

    return (email.touched || email.dirty) && email.valid;
  }

  sendResetLink(): void {
    const email = this.forgotForm.controls.email;

    email.markAsTouched();

    if (email.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submittedEmail = email.value ?? '';
    this.requestError = null;

    this.passwordRecovery
      .requestReset(this.submittedEmail)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.emailSent = true;
          this.startResendCooldown();
        },
        error: (error: HttpErrorResponse) => {
          this.requestError =
            error.status === 0
              ? 'Unable to connect to the BookHive server.'
              : 'Unable to request a reset link. Please try again.';
        },
      });
  }

  resendEmail(): void {
    if (this.resendCooldown > 0 || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.requestError = null;

    this.passwordRecovery
      .requestReset(this.submittedEmail)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.startResendCooldown(),
        error: () => {
          this.requestError = 'Unable to resend the reset link. Please try again.';
        },
      });
  }

  private startResendCooldown(): void {
    this.resendCooldown = 30;

    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }

    this.cooldownTimer = setInterval(() => {
      if (this.resendCooldown > 0) {
        this.resendCooldown--;
      } else {
        if (this.cooldownTimer) {
          clearInterval(this.cooldownTimer);
          this.cooldownTimer = undefined;
        }
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }
}
