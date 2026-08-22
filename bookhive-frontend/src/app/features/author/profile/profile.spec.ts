import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  Profile
} from './profile';

describe(
  'Profile',
  () => {

    let component: Profile;

    let fixture:
      ComponentFixture<Profile>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          Profile
        ],
        providers: [
          provideRouter([])
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          Profile
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain author name',
      () => {
        expect(component.authorName)
          .toBe('Julian Barnes');
      }
    );

    it(
      'should show edit profile message',
      () => {
        component.editProfile();

        expect(component.editMessage)
          .toBe(
            'Edit Profile form will open here.'
          );
      }
    );

    it(
      'should close action message',
      () => {
        component.editProfile();

        component.closeMessage();

        expect(component.editMessage)
          .toBe('');
      }
    );
  }
);
