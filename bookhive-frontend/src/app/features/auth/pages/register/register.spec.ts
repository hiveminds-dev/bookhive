import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { RegistrationService } from '../../services/registration';
import { Register } from './register';

describe('Register Component', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let mockRegistrationService: {
    registerReader: ReturnType<typeof vi.fn>;
    registerAuthor: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockRegistrationService = {
      registerReader: vi.fn().mockReturnValue(of({ message: 'Success', email: 'test@example.com' })),
      registerAuthor: vi.fn().mockReturnValue(of({ message: 'Success', email: 'author@example.com' })),
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
});
