import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { EmailVerificationService } from '../../services/email-verification';
import { VerificationSuccess } from './verification-success';

describe('VerificationSuccess', () => {
  let component: VerificationSuccess;
  let fixture: ComponentFixture<VerificationSuccess>;
  let router: Router;
  const emailVerificationService = {
    verifyEmail: vi.fn(() =>
      of({ message: 'Email verified successfully', role: 'reader', account_status: 'active' }),
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationSuccess],
      providers: [
        provideRouter([]),
        { provide: EmailVerificationService, useValue: emailVerificationService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ token: 'secure-token' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificationSuccess);

    component = fixture.componentInstance;

    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login when continue is clicked', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.goToLogin();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should display the success message', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Verification successful');

    expect(element.textContent).toContain('your BookHive account is ready to use.');
  });

  it('should display the welcome message', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Welcome to BookHive!');
  });

  it('should use an icon instead of a celebration emoji', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.celebration-icon')).toBeTruthy();
    expect(element.textContent).not.toContain('🎉');
  });
});
