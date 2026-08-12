import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword implements OnDestroy {

  private fb = inject(FormBuilder);

  readonly appName = 'BookHive';
  readonly logoPath = 'assets/bookhive-logo.png';

  isSubmitting = false;
  emailSent = false;

  submittedEmail = '';

  resendCooldown = 0;

  private cooldownTimer?: ReturnType<typeof setInterval>;

  forgotForm = this.fb.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]]
  });

  hasEmailError(): boolean {
    const email = this.forgotForm.controls.email;

    return (
      (email.touched || email.dirty) &&
      email.invalid
    );
  }

  isEmailValid(): boolean {
    const email = this.forgotForm.controls.email;

    return (
      (email.touched || email.dirty) &&
      email.valid
    );
  }

  sendResetLink(): void {

    const email = this.forgotForm.controls.email;

    email.markAsTouched();

    if (email.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.submittedEmail = email.value ?? '';

    setTimeout(() => {

      this.isSubmitting = false;
      this.emailSent = true;

      this.startResendCooldown();

    }, 1200);
  }

  resendEmail(): void {

    if (
      this.resendCooldown > 0 ||
      this.isSubmitting
    ) {
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => {

      this.isSubmitting = false;

      this.startResendCooldown();

    }, 1000);
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
