import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ProfileInformation
} from './profile-information';

describe(
  'ProfileInformation',
  () => {

    let component: ProfileInformation;

    let fixture:
      ComponentFixture<ProfileInformation>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ProfileInformation
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          ProfileInformation
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain four contact details',
      () => {
        expect(
          component.contactDetails.length
        ).toBe(4);
      }
    );

    it(
      'should contain three social links',
      () => {
        expect(
          component.socialLinks.length
        ).toBe(3);
      }
    );

    it(
      'should contain biography',
      () => {
        expect(component.biography.length)
          .toBeGreaterThan(0);
      }
    );
  }
);
