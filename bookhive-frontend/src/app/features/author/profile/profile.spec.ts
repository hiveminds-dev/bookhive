import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { Auth } from '../../../core/services/auth';
import { AuthenticatedUser } from '../../auth/models/login';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let router: Router;
  let currentUserSignal: ReturnType<typeof signal<AuthenticatedUser | null>>;

  beforeEach(async () => {
    currentUserSignal = signal<AuthenticatedUser | null>({
      id: 1,
      full_name: 'Eleanor Vance',
      username: 'eleanorv',
      email: 'eleanor.v@lumina.com',
      role: 'author' as const,
      account_status: 'approved',
      email_verified: true,
    });

    await TestBed.configureTestingModule({
      imports: [Profile],
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

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain author name from authenticated session', () => {
    expect(component.authorName()).toBe('Eleanor Vance');
    expect(component.penName()).toBe('@eleanorv');
  });

  it('should navigate to edit profile', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.editProfile();

    expect(navigateSpy).toHaveBeenCalledWith(['/author/profile/edit']);
  });

  it('should navigate to change password', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.changePassword();

    expect(navigateSpy).toHaveBeenCalledWith([
      '/author/profile/change-password',
    ]);
  });
});
