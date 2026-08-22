import {
  signal
} from '@angular/core';

import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter,
  Router
} from '@angular/router';

import {
  vi
} from 'vitest';

import {
  Auth
} from '../../../core/services/auth';

import {
  Profile
} from './profile';

describe(
  'Profile',
  () => {

    let component: Profile;

    let fixture:
      ComponentFixture<Profile>;

    let router: Router;

    beforeEach(async () => {
      const currentUser = signal({
        id: 1,
        full_name: 'Julian Barnes',
        username: 'julian',
        email: 'julian@example.com',
        role: 'author' as const,
        account_status: 'approved',
        email_verified: true
      });

      await TestBed.configureTestingModule({
        imports: [
          Profile
        ],
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

      fixture =
        TestBed.createComponent(
          Profile
        );

      component = fixture.componentInstance;

      router = TestBed.inject(Router);

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain author name',
      () => {
        expect(component.authorName())
          .toBe('Julian Barnes');
      }
    );

    it(
      'should navigate to edit profile',
      () => {
        const navigateSpy =
          vi.spyOn(router, 'navigate');

        component.editProfile();

        expect(navigateSpy)
          .toHaveBeenCalledWith([
            '/author/profile/edit'
          ]);
      }
    );

    it(
      'should navigate to change password',
      () => {
        const navigateSpy =
          vi.spyOn(router, 'navigate');

        component.changePassword();

        expect(navigateSpy)
          .toHaveBeenCalledWith([
            '/author/profile/change-password'
          ]);
      }
    );
  }
);
