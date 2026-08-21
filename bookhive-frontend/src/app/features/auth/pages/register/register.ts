import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideBookOpen,
  LucideCheck,
  LucideEye,
  LucideEyeOff,
  LucideLockKeyhole,
  LucideMail,
  LucidePenLine,
  LucideShieldCheck,
  LucideSparkles,
} from '@lucide/angular';
import {
  AuthorRegistrationRequest,
  ReaderRegistrationRequest,
} from '../../models/registration';
import { RegistrationService } from '../../services/registration';

const USERNAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{2,49}$/;

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideArrowLeft,
    LucideArrowRight,
    LucideBookOpen,
    LucideCheck,
    LucideEye,
    LucideEyeOff,
    LucideLockKeyhole,
    LucideMail,
    LucidePenLine,
    LucideShieldCheck,
    LucideSparkles,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private changeDetector = inject(ChangeDetectorRef);
  private registrationService = inject(RegistrationService);
  private router = inject(Router);

  readonly appName = 'BookHive';
  readonly logoPath = 'assets/bookhive-logo.png';

  // =========================
  // REGISTRATION STATE
  // =========================

  accountType: 'reader' | 'author' = 'reader';

  currentStep = 1;
  readonly totalSteps = 4;

  isSubmitting = false;
  registrationError: string | null = null;
  registrationSuccess: string | null = null;

  // =========================
  // PASSWORD
  // =========================

  showPassword = false;
  showConfirmPassword = false;

  // =========================
  // READER FORM
  // =========================

  readerForm = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],

      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(USERNAME_PATTERN),
        ],
      ],

      email: ['', [Validators.required, Validators.email]],

      password: ['', [Validators.required, Validators.minLength(8)]],

      confirmPassword: ['', Validators.required],

      terms: [false, Validators.requiredTrue],
    },
    {
      validators: passwordsMatchValidator,
    },
  );

  // =========================
  // AUTHOR FORM
  // =========================

  authorForm = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],

      penName: ['', [Validators.required, Validators.minLength(2)]],

      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(USERNAME_PATTERN),
        ],
      ],

      email: ['', [Validators.required, Validators.email]],

      country: ['', Validators.required],

      language: ['', Validators.required],

      bio: ['', [Validators.required, Validators.minLength(10)]],

      password: ['', [Validators.required, Validators.minLength(8)]],

      confirmPassword: ['', Validators.required],

      agreement: [false, Validators.requiredTrue],
    },
    {
      validators: passwordsMatchValidator,
    },
  );

  // =========================
  // ACTIVE FORM
  // =========================

  get activeForm(): FormGroup {
    return this.accountType === 'reader' ? this.readerForm : this.authorForm;
  }

  // =========================
  // STEP TITLE
  // =========================

  get stepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Choose Account';
      case 2:
        return 'Personal Information';
      case 3:
        return 'Contact & Profile';
      case 4:
        return 'Security';
      default:
        return 'Create Account';
    }
  }

  get stepDescription(): string {
    switch (this.currentStep) {
      case 1:
        return 'Choose how you want to use BookHive.';
      case 2:
        return 'Tell us a little about yourself.';
      case 3:
        return 'Add your contact and profile details.';
      case 4:
        return 'Secure your BookHive account.';
      default:
        return '';
    }
  }

  // =========================
  // ACCOUNT TYPE
  // =========================

  selectAccountType(type: 'reader' | 'author'): void {
    this.accountType = type;
    this.registrationError = null;
    this.registrationSuccess = null;

  }

  // =========================
  // STEP NAVIGATION
  // =========================

  nextStep(): void {
    if (this.currentStep === 1) {
      this.currentStep = 2;
      return;
    }

    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step < 1 || step > this.totalSteps) {
      return;
    }

    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  // =========================
  // VALIDATION
  // =========================

  private validateCurrentStep(): boolean {
    const form: FormGroup = this.activeForm;

    let fields: string[] = [];

    if (this.currentStep === 2) {
      fields =
        this.accountType === 'reader'
          ? ['fullName', 'username']
          : ['fullName', 'penName', 'username'];
    }

    if (this.currentStep === 3) {
      fields = this.accountType === 'reader' ? ['email'] : ['email', 'country', 'language', 'bio'];
    }

    if (this.currentStep === 4) {
      fields = [
        'password',
        'confirmPassword',
        this.accountType === 'reader' ? 'terms' : 'agreement',
      ];
    }

    let valid = true;

    for (const fieldName of fields) {
      const field = form.get(fieldName);

      if (!field) {
        continue;
      }

      field.markAsTouched();
      field.updateValueAndValidity();

      if (field.invalid) {
        valid = false;
      }
    }

    if (this.currentStep === 4 && form.hasError('passwordMismatch')) {
      valid = false;

      form.get('confirmPassword')?.markAsTouched();
    }

    return valid;
  }

  hasFieldError(form: AbstractControl, fieldName: string, errorName: string): boolean {
    const field = form.get(fieldName);

    return !!field && (field.touched || field.dirty) && field.hasError(errorName);
  }

  hasPasswordMismatch(form: AbstractControl): boolean {
    const confirmPassword = form.get('confirmPassword');

    return (
      !!confirmPassword &&
      (confirmPassword.touched || confirmPassword.dirty) &&
      form.hasError('passwordMismatch')
    );
  }

  // =========================
  // PASSWORD VISIBILITY
  // =========================

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // =========================
  // REGISTER
  // =========================

  private buildReaderRequest(): ReaderRegistrationRequest {
    const value = this.readerForm.getRawValue();

    return {
      full_name: value.fullName!.trim(),
      username: value.username!.trim().toLowerCase(),
      email: value.email!.trim().toLowerCase(),
      password: value.password!,
    };
  }

  private buildAuthorRequest(): AuthorRegistrationRequest {
    const value = this.authorForm.getRawValue();

    return {
      full_name: value.fullName!.trim(),
      username: value.username!.trim().toLowerCase(),
      email: value.email!.trim().toLowerCase(),
      password: value.password!,
      pen_name: value.penName!.trim(),
      country: value.country!.trim(),
      preferred_language: value.language!.trim(),
      short_bio: value.bio!.trim(),
    };
  }

  register(): void {
    if (this.isSubmitting || this.registrationSuccess) {
      return;
    }

    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.activeForm.invalid) {
      this.activeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.registrationError = null;
    this.registrationSuccess = null;

    const request$: Observable<unknown> =
      this.accountType === 'reader'
        ? this.registrationService.registerReader(this.buildReaderRequest())
        : this.registrationService.registerAuthor(this.buildAuthorRequest());

    request$
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
      next: () => {
        const email = this.activeForm.get('email')?.value?.trim().toLowerCase() ?? '';
        void this.router.navigate(['/auth/verify-email'], { queryParams: { email } });
      },
      error: (error: HttpErrorResponse) => {
        this.registrationError = this.getRegistrationError(error);
        this.changeDetector.markForCheck();
      },
      });
  }

  private getRegistrationError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to connect to the BookHive server. Please try again.';
    }

    const detail = error.error?.detail;

    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      const validationMessage = detail
        .map((item) => item?.msg)
        .filter((message): message is string => typeof message === 'string')
        .join(' ');

      if (validationMessage) {
        return validationMessage;
      }
    }

    return 'Registration failed. Please check your details and try again.';
  }
}
