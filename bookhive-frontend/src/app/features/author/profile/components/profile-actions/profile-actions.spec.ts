import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ProfileActions
} from './profile-actions';

describe(
  'ProfileActions',
  () => {

    let component: ProfileActions;

    let fixture:
      ComponentFixture<ProfileActions>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ProfileActions
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          ProfileActions
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should emit edit profile event',
      () => {
        let eventEmitted = false;

        component.editProfileSelected
          .subscribe(() => {
            eventEmitted = true;
          });

        component.editProfile();

        expect(eventEmitted).toBe(true);
      }
    );

    it(
      'should emit change password event',
      () => {
        let eventEmitted = false;

        component.changePasswordSelected
          .subscribe(() => {
            eventEmitted = true;
          });

        component.changePassword();

        expect(eventEmitted).toBe(true);
      }
    );
  }
);
