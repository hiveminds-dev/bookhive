import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  BiographyForm
} from './biography-form';

describe(
  'BiographyForm',
  () => {

    let component: BiographyForm;

    let fixture:
      ComponentFixture<BiographyForm>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          BiographyForm
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          BiographyForm
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain default biography',
      () => {
        expect(component.characterCount)
          .toBeGreaterThan(0);
      }
    );

    it(
      'should make short biography invalid',
      () => {
        component.biographyForm.controls
          .biography.setValue('Too short');

        expect(
          component.biographyForm.invalid
        ).toBe(true);
      }
    );

    it(
      'should emit valid biography',
      () => {
        let emittedBiography = '';

        component.biographyChanged
          .subscribe(value => {
            emittedBiography = value;
          });

        const biography =
          'This is a valid author biography with more than fifty characters for testing purposes.';

        component.biographyForm.controls
          .biography.setValue(biography);

        expect(emittedBiography)
          .toBe(biography);
      }
    );
  }
);
