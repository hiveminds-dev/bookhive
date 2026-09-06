import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
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
import { finalize, Observable, Subscription } from 'rxjs';
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
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnDestroy {
  private fb = inject(FormBuilder);
  private changeDetector = inject(ChangeDetectorRef);
  private registrationService = inject(RegistrationService);
  private router = inject(Router);

  readonly appName = 'BookHive';
  readonly logoPath = 'assets/bookhive-logo.v2.png';

  // =========================
  // REGISTRATION STATE
  // =========================

  accountType: 'reader' | 'author' | null = null;
  step1Error: string | null = null;

  currentStep = 1;
  readonly totalSteps = 4;

  isSubmitting = false;
  isCheckingEmail = false;
  emailTakenError: string | null = null;
  registrationError: string | null = null;
  registrationSuccess: string | null = null;

  private emailCheckSubscription: Subscription | null = null;
  private lastCheckedEmail: string | null = null;
  private lastCheckedResult: boolean | null = null;
  private emailCheckGeneration = 0;
  private pendingNextCallback: (() => void) | null = null;

  ngOnDestroy(): void {
    this.emailCheckSubscription?.unsubscribe();
  }

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
    return this.accountType === 'author' ? this.authorForm : this.readerForm;
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
    this.step1Error = null;
    this.registrationError = null;
    this.registrationSuccess = null;
  }

  selectAccountTypeAndContinue(type: 'reader' | 'author', event: Event): void {
    event.preventDefault();
    this.selectAccountType(type);
    this.nextStep();
  }

  focusRegisterField(event: Event, controlName: string): void {
    event.preventDefault();
    this.focusControl(controlName);
  }

  submitCurrentStepFromKeyboard(event: Event): void {
    event.preventDefault();

    if (this.currentStep < this.totalSteps) {
      this.nextStep();
      return;
    }

    this.register();
  }

  // =========================
  // STEP NAVIGATION
  // =========================

  nextStep(): void {
    if (this.isCheckingEmail || this.isSubmitting) {
      return;
    }

    if (this.currentStep === 1) {
      if (!this.accountType) {
        this.step1Error = 'Please select an account type (Reader or Author) to continue.';
        this.changeDetector.markForCheck();
        this.focusAccountSelection();
        return;
      }
      this.step1Error = null;
      this.currentStep = 2;
      this.changeDetector.markForCheck();
      this.focusFirstFieldInStep();
      return;
    }

    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.currentStep === 3) {
      this.verifyEmailAvailability(() => {
        this.currentStep = 4;
        this.changeDetector.markForCheck();
        this.focusFirstFieldInStep();
      });
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.changeDetector.markForCheck();
      this.focusFirstFieldInStep();
    }
  }

  verifyEmailAvailability(onSuccess?: () => void): void {
    const emailControl = this.activeForm.get('email');
    if (!emailControl || emailControl.invalid || !emailControl.value) {
      return;
    }

    const email = (emailControl.value as string).trim().toLowerCase();
    if (!email) {
      return;
    }

    // If this exact email was already verified and result is known
    if (this.lastCheckedEmail === email && this.lastCheckedResult !== null) {
      if (this.lastCheckedResult === true) {
        this.emailTakenError = null;
        if (onSuccess) {
          onSuccess();
        }
        return;
      } else {
        this.emailTakenError =
          this.emailTakenError ||
          'This email address is already registered. Please sign in or use another email.';
        return;
      }
    }

    // If check is already in-flight
    if (this.isCheckingEmail) {
      if (this.lastCheckedEmail === email) {
        if (onSuccess) {
          this.pendingNextCallback = onSuccess;
        }
        return;
      }
      this.emailCheckSubscription?.unsubscribe();
    }

    this.isCheckingEmail = true;
    this.emailTakenError = null;
    this.pendingNextCallback = onSuccess ?? null;
    this.lastCheckedEmail = email;
    const currentGen = ++this.emailCheckGeneration;
    this.changeDetector.markForCheck();

    this.emailCheckSubscription = this.registrationService
      .checkEmailAvailability(email)
      .subscribe({
        next: (res) => {
          if (currentGen !== this.emailCheckGeneration) {
            return;
          }
          this.isCheckingEmail = false;
          this.lastCheckedResult = res.available;
          if (!res.available) {
            this.emailTakenError =
              res.message ||
              'This email address is already registered. Please sign in or use another email.';
            this.pendingNextCallback = null;
          } else {
            this.emailTakenError = null;
            const cb = this.pendingNextCallback;
            this.pendingNextCallback = null;
            if (cb) {
              cb();
            }
          }
          this.changeDetector.markForCheck();
        },
        error: () => {
          if (currentGen !== this.emailCheckGeneration) {
            return;
          }
          this.isCheckingEmail = false;
          this.lastCheckedEmail = null;
          this.lastCheckedResult = null;
          this.pendingNextCallback = null;
          this.emailTakenError = 'Unable to verify this email address. Please try again.';
          this.changeDetector.markForCheck();
        },
      });
  }

  onEmailBlur(): void {
    this.verifyEmailAvailability();
  }

  onEmailInput(): void {
    if (this.isCheckingEmail) {
      this.emailCheckSubscription?.unsubscribe();
      this.isCheckingEmail = false;
    }
    this.lastCheckedEmail = null;
    this.lastCheckedResult = null;
    this.pendingNextCallback = null;
    if (this.emailTakenError) {
      this.emailTakenError = null;
      this.changeDetector.markForCheck();
    }
  }

  private focusAccountSelection(): void {
    setTimeout(() => {
      const firstOption = document.querySelector<HTMLElement>('.account-card');
      firstOption?.focus();
    }, 0);
  }

  private focusFirstFieldInStep(): void {
    setTimeout(() => {
      const selector =
        this.currentStep === 2
          ? '[formControlName="fullName"]'
          : this.currentStep === 3
            ? '[formControlName="email"]'
            : this.currentStep === 4
              ? '[formControlName="password"]'
              : '';

      if (!selector) {
        return;
      }

      document.querySelector<HTMLElement>(selector)?.focus();
    }, 0);
  }

  private focusControl(controlName: string): void {
    setTimeout(() => {
      document.querySelector<HTMLElement>(`[formControlName="${controlName}"]`)?.focus();
    }, 0);
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.changeDetector.markForCheck();
    }
  }

  goToStep(step: number): void {
    if (step < 1 || step > this.totalSteps) {
      return;
    }

    if (step < this.currentStep) {
      this.currentStep = step;
      this.changeDetector.markForCheck();
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
