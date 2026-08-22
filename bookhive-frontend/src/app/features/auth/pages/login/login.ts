import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { finalize } from 'rxjs';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideEye, LucideEyeOff],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(Auth);
  private changeDetector = inject(ChangeDetectorRef);

  readonly appName = 'BookHive';
  readonly logoPath = 'assets/bookhive-logo.png';
  showPassword = false;
  isSubmitting = false;
  loginError: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  hasFieldError(fieldName: 'email' | 'password'): boolean {
    const field = this.loginForm.get(fieldName);

    return !!field && (field.touched || field.dirty) && field.invalid;
  }

  signIn(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const value = this.loginForm.getRawValue();
    this.isSubmitting = true;
    this.loginError = null;

    this.auth
      .login(
        {
          email: value.email!.trim().toLowerCase(),
          password: value.password!,
        },
        value.rememberMe ?? false,
      )
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          const target =
            response.user.role === 'admin'
              ? '/admin/dashboard'
              : response.user.role === 'author'
                ? '/author/dashboard'
                : '/home';
          void this.router.navigateByUrl(target);
        },
        error: (error: HttpErrorResponse) => {
          this.loginError =
            typeof error.error?.detail === 'string'
              ? error.error.detail
              : error.status === 0
                ? 'Unable to connect to the BookHive server.'
                : 'Sign in failed. Please try again.';
          this.changeDetector.markForCheck();
        },
      });
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
