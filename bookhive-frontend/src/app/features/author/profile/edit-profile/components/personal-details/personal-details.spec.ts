import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auth } from '../../../../../../core/services/auth';
import { AuthenticatedUser } from '../../../../../auth/models/login';
import { PersonalDetails } from './personal-details';

describe('PersonalDetails', () => {
  let component: PersonalDetails;
  let fixture: ComponentFixture<PersonalDetails>;
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
      imports: [PersonalDetails],
      providers: [
        {
          provide: Auth,
          useValue: {
            currentUser: currentUserSignal.asReadonly(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain valid default values from authenticated author', () => {
    expect(component.detailsForm.valid).toBe(true);
    expect(component.detailsForm.controls.fullName.value).toBe('Eleanor Vance');
    expect(component.detailsForm.controls.email.value).toBe('eleanor.v@lumina.com');
    expect(component.detailsForm.controls.penName.value).toBe('eleanorv');
  });

  it('should make form invalid for bad email', () => {
    component.detailsForm.controls.email.setValue('invalid-email');

    expect(component.detailsForm.invalid).toBe(true);
  });

  it('should emit valid details', () => {
    let emittedName = '';

    component.detailsChanged.subscribe((details) => {
      emittedName = details.fullName;
    });

    component.emitDetails();

    expect(emittedName).toBe('Eleanor Vance');
  });
});
