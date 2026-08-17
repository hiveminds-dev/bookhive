import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faApple, faFacebookF, faGoogle, faXTwitter } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideEye, LucideEyeOff, FontAwesomeModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly appName = 'BookHive';
  readonly logoPath = 'assets/bookhive-logo.png';
  readonly socialIcons = {
    google: faGoogle,
    facebook: faFacebookF,
    apple: faApple,
    x: faXTwitter,
  };

  showPassword = false;

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
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    console.log('Login form submitted:', this.loginForm.value);
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
