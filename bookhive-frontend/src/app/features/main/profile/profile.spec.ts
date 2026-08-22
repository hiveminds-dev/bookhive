import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Auth } from '../../../core/services/auth';
import { ReaderProfile } from './profile';

describe('ReaderProfile', () => {
  let component: ReaderProfile;
  let fixture: ComponentFixture<ReaderProfile>;

  beforeEach(async () => {
    const currentUser = signal({
      id: 1,
      full_name: 'Reader One',
      username: 'reader_one',
      email: 'reader@example.com',
      role: 'reader' as const,
      account_status: 'active',
      email_verified: true
    });

    await TestBed.configureTestingModule({
      imports: [ReaderProfile],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            currentUser: currentUser.asReadonly()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReaderProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the logged-in reader identity', () => {
    expect(component.displayName()).toBe('Reader One');
    expect(component.username()).toBe('@reader_one');
  });
});
