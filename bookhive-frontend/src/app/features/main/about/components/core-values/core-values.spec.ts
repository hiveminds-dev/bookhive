import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  CoreValues
} from './core-values';

describe(
  'CoreValues',
  () => {

    let component: CoreValues;

    let fixture:
      ComponentFixture<CoreValues>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          CoreValues
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          CoreValues
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain four values',
      () => {
        expect(component.values.length)
          .toBe(4);
      }
    );

    it(
      'should contain knowledge value',
      () => {
        expect(component.values[0].title)
          .toBe('Knowledge');
      }
    );
  }
);
