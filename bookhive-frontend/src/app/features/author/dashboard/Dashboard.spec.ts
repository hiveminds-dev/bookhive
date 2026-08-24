import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Auth } from '../../../core/services/auth';
import { AuthenticatedUser } from '../../auth/models/login';
import { AuthorDashboardComponent } from './dashboard';

describe('AuthorDashboardComponent', () => {
  let component: AuthorDashboardComponent;
  let fixture: ComponentFixture<AuthorDashboardComponent>;
  let currentUserSignal: ReturnType<typeof signal<AuthenticatedUser | null>>;

  beforeEach(async () => {
    currentUserSignal = signal<AuthenticatedUser | null>({
      id: 1,
      full_name: 'Eleanor Vance',
      username: 'eleanorv',
      email: 'eleanor.v@lumina.com',
      role: 'author',
      account_status: 'approved',
      email_verified: true,
    });

    await TestBed.configureTestingModule({
      imports: [AuthorDashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            currentUser: currentUserSignal.asReadonly(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the authenticated author first name', () => {
    expect(component.authorFirstName()).toBe('Eleanor');
  });

  it('should fallback to Author if full_name is empty', () => {
    currentUserSignal.set(null);
    fixture.detectChanges();

    expect(component.authorFirstName()).toBe('Author');
  });

  it('should contain four statistics', () => {
    expect(component.statistics.length).toBe(4);
  });

  it('should contain recent books', () => {
    expect(component.recentBooks.length).toBe(3);
  });

  it('should contain recent reviews', () => {
    expect(component.recentReviews.length).toBe(2);
  });

  it('should contain recent activities', () => {
    expect(component.activities.length).toBe(3);
  });
});
