import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  SocialLinksForm
} from './social-links-form';

describe(
  'SocialLinksForm',
  () => {

    let component:
      SocialLinksForm;

    let fixture:
      ComponentFixture<SocialLinksForm>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          SocialLinksForm
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          SocialLinksForm
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should accept valid URLs',
      () => {
        expect(component.socialForm.valid)
          .toBe(true);
      }
    );

    it(
      'should reject invalid website URL',
      () => {
        component.socialForm.controls
          .website.setValue(
          'invalid-url'
        );

        expect(component.socialForm.invalid)
          .toBe(true);
      }
    );

    it(
      'should emit valid social links',
      () => {
        let emittedWebsite = '';

        component.socialLinksChanged
          .subscribe(value => {
            emittedWebsite =
              value.website;
          });

        component.emitSocialLinks();

        expect(emittedWebsite)
          .toBe(
            'https://example.com'
          );
      }
    );
  }
);
