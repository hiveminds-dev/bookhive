import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { EmailVerificationService } from '../../services/email-verification';
import { VerifyEmail } from './verify-email';

describe('VerifyEmail', () => {
  let component: VerifyEmail;
  let fixture: ComponentFixture<VerifyEmail>;
  const emailVerificationService = {
    resendVerification: vi.fn(() => of({ message: 'A new link has been sent.' })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyEmail],
      providers: [
        provideRouter([]),
        { provide: EmailVerificationService, useValue: emailVerificationService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ email: 'reader@example.com' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyEmail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an email address and verification guidance', () => {
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('reader@example.com');
    expect(element.textContent).toContain('Verify your email address');
    expect(element.textContent).toContain('Resend verification email');
  });

  it('should use icons instead of emoji characters', () => {
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.mail-icon')).toBeTruthy();
    expect(element.textContent).not.toContain('✉');
    expect(element.textContent).not.toContain('✓');
  });

  it('resends the verification email', () => {
    component.resendEmail();

    expect(emailVerificationService.resendVerification).toHaveBeenCalledWith(
      'reader@example.com',
    );
    expect(component.resendMessage).toBe('A new link has been sent.');
  });
});
