import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  EditProfile
} from './edit-profile';

describe(
  'EditProfile',
  () => {

    let component: EditProfile;

    let fixture:
      ComponentFixture<EditProfile>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          EditProfile
        ],
        providers: [
          provideRouter([])
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          EditProfile
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain default profile details',
      () => {
        expect(
          component.personalDetails.fullName
        ).toBe('Julian Barnes');
      }
    );

    it(
      'should update biography',
      () => {
        const biography =
          'This is an updated author biography.';

        component.onBiographyChanged(
          biography
        );

        expect(component.biography)
          .toBe(biography);
      }
    );

    it(
      'should start saving profile',
      () => {
        component.saveProfile();

        expect(component.isSaving)
          .toBe(true);
      }
    );
  }
);
