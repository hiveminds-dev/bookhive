import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  WhyBookhive
} from './why-bookhive';

describe('WhyBookhive', () => {

  let component: WhyBookhive;

  let fixture:
    ComponentFixture<WhyBookhive>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          WhyBookhive
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          WhyBookhive
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain three features',
      () => {
        expect(component.features.length)
          .toBe(3);
      }
    );

    it(
      'should contain large book collection',
      () => {
        expect(
          component.features[0].title
        ).toBe(
          'Large Book Collection'
        );
      }
    );

    it(
      'should contain easy publishing',
      () => {
        expect(
          component.features[1].title
        ).toBe(
          'Easy Publishing'
        );
      }
    );

    it(
      'should contain fast search',
      () => {
        expect(
          component.features[2].title
        ).toBe(
          'Fast Search'
        );
      }
    );
  }
);
