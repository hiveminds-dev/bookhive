import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegistrationService } from '../../services/registration';
import { Register } from './register';

describe('Register Component', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let mockRegistrationService: {
    registerReader: ReturnType<typeof vi.fn>;
    registerAuthor: ReturnType<typeof vi.fn>;
    checkEmailAvailability: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockRegistrationService = {
      registerReader: vi.fn().mockReturnValue(of({ message: 'Success', email: 'test@example.com' })),
      registerAuthor: vi.fn().mockReturnValue(of({ message: 'Success', email: 'author@example.com' })),
      checkEmailAvailability: vi.fn().mockReturnValue(of({ available: true, message: null })),
    };

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        { provide: RegistrationService, useValue: mockRegistrationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on Step 1 with no accountType pre-selected', () => {
    expect(component.currentStep).toBe(1);
    expect(component.accountType).toBeNull();
    expect(component.step1Error).toBeNull();
  });

  it('should show validation error and stay on Step 1 when clicking next without selecting account type', () => {
    component.nextStep();
    fixture.detectChanges();

    expect(component.currentStep).toBe(1);
    expect(component.step1Error).toBeTruthy();
    expect(component.step1Error).toContain('select an account type');
  });

  it('should clear validation error when account type is selected', () => {
    component.nextStep();
    fixture.detectChanges();
    expect(component.step1Error).toBeTruthy();

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.account-card');
    buttons[0].click();
    fixture.detectChanges();

    expect(component.accountType).toBe('reader');
    expect(component.step1Error).toBeNull();
  });

  it('should advance to Step 2 when account type is selected and nextStep is called', () => {
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.account-card');
    buttons[0].click();
    fixture.detectChanges();

    component.nextStep();
    fixture.detectChanges();

    expect(component.currentStep).toBe(2);
    expect(component.step1Error).toBeNull();
  });

  it('should advance to Step 2 for author account type', () => {
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.account-card');
    buttons[1].click();
    fixture.detectChanges();

    component.nextStep();
    fixture.detectChanges();

    expect(component.currentStep).toBe(2);
    expect(component.accountType).toBe('author');
  });

  it('should allow navigation back to Step 1 and retain or update selection', () => {
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.account-card');
    buttons[0].click();
    fixture.detectChanges();

    component.nextStep();
    fixture.detectChanges();
    expect(component.currentStep).toBe(2);

    component.previousStep();
    fixture.detectChanges();
    expect(component.currentStep).toBe(1);
    expect(component.accountType).toBe('reader');

    const updatedButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.account-card');
    updatedButtons[1].click();
    fixture.detectChanges();
    expect(component.accountType).toBe('author');

    component.nextStep();
    fixture.detectChanges();
    expect(component.currentStep).toBe(2);
  });

  describe('Email Availability Checking', () => {
    beforeEach(() => {
      component.selectAccountType('reader');
      component.nextStep(); // to step 2
      component.readerForm.patchValue({
        fullName: 'Jane Doe',
        username: 'janedoe',
      });
      component.nextStep(); // to step 3
      fixture.detectChanges();
    });

    it('should verify available email and proceed to Step 4 when next is clicked', () => {
      mockRegistrationService.checkEmailAvailability.mockReturnValue(
        of({ available: true, message: null })
      );
      component.readerForm.patchValue({ email: 'newuser@example.com' });

      component.nextStep();
      fixture.detectChanges();

      expect(mockRegistrationService.checkEmailAvailability).toHaveBeenCalledWith('newuser@example.com');
      expect(component.currentStep).toBe(4);
      expect(component.emailTakenError).toBeNull();
    });

    it('should set emailTakenError and remain on Step 3 when email is taken', () => {
      mockRegistrationService.checkEmailAvailability.mockReturnValue(
        of({ available: false, message: 'Email already registered' })
      );
      component.readerForm.patchValue({ email: 'taken@example.com' });

      component.nextStep();
      fixture.detectChanges();

      expect(mockRegistrationService.checkEmailAvailability).toHaveBeenCalledWith('taken@example.com');
      expect(component.currentStep).toBe(3);
      expect(component.emailTakenError).toBe('Email already registered');
    });

    it('should show retryable error and stay on Step 3 when email check API fails', () => {
      mockRegistrationService.checkEmailAvailability.mockReturnValue(
        throwError(() => new Error('Server error'))
      );
      component.readerForm.patchValue({ email: 'error@example.com' });

      component.nextStep();
      fixture.detectChanges();

      expect(component.currentStep).toBe(3);
      expect(component.emailTakenError).toBe('Unable to verify this email address. Please try again.');
    });

    it('should prevent duplicate requests when blur is immediately followed by next click', () => {
      mockRegistrationService.checkEmailAvailability.mockReturnValue(
        of({ available: true, message: null })
      );
      component.readerForm.patchValue({ email: 'blur@example.com' });

      component.onEmailBlur();
      component.nextStep();
      fixture.detectChanges();

      expect(mockRegistrationService.checkEmailAvailability).toHaveBeenCalledTimes(1);
    });

    it('should clear emailTakenError when user types in the email field', () => {
      component.readerForm.patchValue({ email: 'existing@example.com' });
      mockRegistrationService.checkEmailAvailability.mockReturnValue(
        of({ available: false, message: 'This email address is already registered.' })
      );
      component.onEmailBlur();
      fixture.detectChanges();
      expect(component.emailTakenError).toBe('This email address is already registered.');

      component.onEmailInput();
      fixture.detectChanges();

      expect(component.emailTakenError).toBeNull();
    });

    it('should not fire availability check if email format is invalid', () => {
      component.readerForm.patchValue({ email: 'not-an-email' });

      component.onEmailBlur();
      fixture.detectChanges();

      expect(mockRegistrationService.checkEmailAvailability).not.toHaveBeenCalled();
    });

    it('should ignore duplicate nextStep clicks while isCheckingEmail is true', () => {
      component.isCheckingEmail = true;
      component.readerForm.patchValue({ email: 'wait@example.com' });

      component.nextStep();
      fixture.detectChanges();

      expect(mockRegistrationService.checkEmailAvailability).not.toHaveBeenCalled();
    });
  });
});
