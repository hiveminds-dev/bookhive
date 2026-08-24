import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Auth } from '../../../../core/services/auth';
import { AuthenticatedUser } from '../../../auth/models/login';
import { EditProfile } from './edit-profile';

describe('EditProfile', () => {
  let component: EditProfile;
  let fixture: ComponentFixture<EditProfile>;
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
      imports: [EditProfile],
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

    fixture = TestBed.createComponent(EditProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain authenticated author details', () => {
    expect(component.personalDetails.fullName).toBe('Eleanor Vance');
    expect(component.personalDetails.email).toBe('eleanor.v@lumina.com');
    expect(component.personalDetails.penName).toBe('eleanorv');
  });

  it('should update biography', () => {
    const biography = 'This is an updated author biography.';
    component.onBiographyChanged(biography);

    expect(component.biography).toBe(biography);
  });

  it('should start saving profile', () => {
    component.saveProfile();

    expect(component.isSaving).toBe(true);
  });
});
