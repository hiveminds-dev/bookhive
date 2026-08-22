import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ReadersChartComponent
} from './readers-chart';

describe(
  'ReadersChartComponent',
  () => {

    let component:
      ReadersChartComponent;

    let fixture:
      ComponentFixture<ReadersChartComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ReadersChartComponent
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          ReadersChartComponent
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain six months',
      () => {
        expect(
          component.monthlyDownloads.length
        ).toBe(6);
      }
    );

    it(
      'should return maximum value',
      () => {
        expect(component.maximumValue)
          .toBe(92);
      }
    );

    it(
      'should calculate bar height',
      () => {
        expect(
          component.getBarHeight(92)
        ).toBe(100);
      }
    );
  }
);
