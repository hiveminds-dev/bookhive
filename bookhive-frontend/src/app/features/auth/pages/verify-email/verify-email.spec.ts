import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { VerifyEmail } from './verify-email';

describe('VerifyEmail', () => {
  let component: VerifyEmail;
  let fixture: ComponentFixture<VerifyEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyEmail],
      providers: [provideRouter([])],
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

    expect(element.textContent).toContain('user@example.com');
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
});
