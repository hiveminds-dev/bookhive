import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  BookPerformanceComponent
} from './book-performance';

describe(
  'BookPerformanceComponent',
  () => {

    let component:
      BookPerformanceComponent;

    let fixture:
      ComponentFixture<BookPerformanceComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          BookPerformanceComponent
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          BookPerformanceComponent
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain reader locations',
      () => {
        expect(
          component.readerLocations.length
        ).toBe(3);
      }
    );

    it(
      'should contain USA as top location',
      () => {
        expect(
          component.readerLocations[0]
            .country
        ).toBe('USA');

        expect(
          component.readerLocations[0]
            .percentage
        ).toBe(42);
      }
    );
  }
);
