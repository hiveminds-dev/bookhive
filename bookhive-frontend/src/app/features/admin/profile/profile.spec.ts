import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auth } from '../../../core/services/auth';
import { AdminProfile } from './profile';

describe('AdminProfile', () => {
  let component: AdminProfile;
  let fixture: ComponentFixture<AdminProfile>;

  beforeEach(async () => {
    const currentUser = signal({
      id: 1,
      full_name: 'System Owner',
      username: 'owner',
      email: 'owner@example.com',
      role: 'super_admin' as const,
      account_status: 'active',
      email_verified: true
    });

    await TestBed.configureTestingModule({
      imports: [AdminProfile],
      providers: [
        {
          provide: Auth,
          useValue: {
            currentUser: currentUser.asReadonly()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show super admin identity from the logged-in user', () => {
    expect(component.displayName()).toBe('System Owner');
    expect(component.roleLabel()).toBe('Super Admin');
  });
});
