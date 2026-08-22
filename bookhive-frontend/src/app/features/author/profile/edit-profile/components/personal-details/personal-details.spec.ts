import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  PersonalDetails
} from './personal-details';

describe(
  'PersonalDetails',
  () => {

    let component: PersonalDetails;

    let fixture:
      ComponentFixture<PersonalDetails>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          PersonalDetails
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          PersonalDetails
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain valid default values',
      () => {
        expect(component.detailsForm.valid)
          .toBe(true);
      }
    );

    it(
      'should make form invalid for bad email',
      () => {
        component.detailsForm.controls.email
          .setValue('invalid-email');

        expect(component.detailsForm.invalid)
          .toBe(true);
      }
    );

    it(
      'should emit valid details',
      () => {
        let emittedName = '';

        component.detailsChanged.subscribe(
          details => {
            emittedName = details.fullName;
          }
        );

        component.emitDetails();

        expect(emittedName)
          .toBe('Julian Barnes');
      }
    );
  }
);
