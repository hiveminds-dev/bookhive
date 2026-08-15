import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { VerificationSuccess } from './verification-success';

describe('VerificationSuccess', () => {
  let component: VerificationSuccess;
  let fixture: ComponentFixture<VerificationSuccess>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationSuccess],
      providers: [
        provideRouter([])
      ]
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

  it('should start with a countdown of 3', () => {
    expect(component.countdown).toBe(3);
  });

  it('should navigate to login when continue is clicked', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.goToLogin();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should display the success message', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain(
      'Verification Successful!'
    );

    expect(element.textContent).toContain(
      'Your BookHive account is now ready.'
    );
  });

  it('should display the welcome message', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain(
      'Welcome to BookHive!'
    );
  });
});
