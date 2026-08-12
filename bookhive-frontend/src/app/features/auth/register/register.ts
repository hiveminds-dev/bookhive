import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  private fb = inject(FormBuilder);

  readonly appName = 'BookHive';
  readonly logoPath = 'assets/bookhive-logo.png';

  // =========================
  // REGISTRATION STATE
  // =========================

  accountType: 'reader' | 'author' = 'reader';

  currentStep = 1;
  readonly totalSteps = 4;

  isSubmitting = false;

  // =========================
  // PASSWORD
  // =========================

  showPassword = false;
  showConfirmPassword = false;

  // =========================
  // PROFILE IMAGE
  // =========================

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  // =========================
  // READER FORM
  // =========================

  readerForm = this.fb.group(
    {
      fullName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],

      username: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],

      email: ['', [
        Validators.required,
        Validators.email
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],

      confirmPassword: ['', Validators.required],

      terms: [false, Validators.requiredTrue]
    },
    {
      validators: passwordsMatchValidator
    }
  );

  // =========================
  // AUTHOR FORM
  // =========================

  authorForm = this.fb.group(
    {
      fullName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],

      penName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],

      username: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],

      email: ['', [
        Validators.required,
        Validators.email
      ]],

      country: ['', Validators.required],

      language: ['', Validators.required],

      bio: ['', [
        Validators.required,
        Validators.minLength(10)
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],

      confirmPassword: ['', Validators.required],

      agreement: [false, Validators.requiredTrue]
    },
    {
      validators: passwordsMatchValidator
    }
  );

  // =========================
  // ACTIVE FORM
  // =========================

  get activeForm(): FormGroup {
    return this.accountType === 'reader'
      ? this.readerForm
      : this.authorForm;
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

    if (type === 'reader') {
      this.selectedImage = null;
      this.imagePreview = null;
    }
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
      fields = this.accountType === 'reader'
        ? [
          'fullName',
          'username'
        ]
        : [
          'fullName',
          'penName',
          'username'
        ];
    }

    if (this.currentStep === 3) {
      fields = this.accountType === 'reader'
        ? [
          'email'
        ]
        : [
          'email',
          'country',
          'language',
          'bio'
        ];
    }

    if (this.currentStep === 4) {
      fields = [
        'password',
        'confirmPassword',
        this.accountType === 'reader'
          ? 'terms'
          : 'agreement'
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

    if (
      this.currentStep === 4 &&
      form.hasError('passwordMismatch')
    ) {
      valid = false;

      form
        .get('confirmPassword')
        ?.markAsTouched();
    }

    return valid;
  }

  hasFieldError(
    form: AbstractControl,
    fieldName: string,
    errorName: string
  ): boolean {

    const field = form.get(fieldName);

    return !!field &&
      (field.touched || field.dirty) &&
      field.hasError(errorName);
  }

  hasPasswordMismatch(form: AbstractControl): boolean {

    const confirmPassword = form.get('confirmPassword');

    return !!confirmPassword &&
      (confirmPassword.touched || confirmPassword.dirty) &&
      form.hasError('passwordMismatch');
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
  // IMAGE UPLOAD
  // =========================

  onImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    this.setSelectedImage(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {

    event.preventDefault();

    const files = event.dataTransfer?.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      alert('Please drop an image file.');
      return;
    }

    this.setSelectedImage(file);
  }

  private setSelectedImage(file: File): void {

    this.selectedImage = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  // =========================
  // REGISTER
  // =========================

  register(): void {

    if (this.isSubmitting) {
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

    setTimeout(() => {

      if (this.accountType === 'reader') {

        console.log('Reader registration:', {
          ...this.readerForm.value,
          accountType: 'reader'
        });

        alert('Reader account form is valid!');

      } else {

        console.log('Author registration:', {
          ...this.authorForm.value,
          accountType: 'author',
          profileImage: this.selectedImage
        });

        alert('Author account form is valid!');
      }

      this.isSubmitting = false;

    }, 800);
  }
}
