import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ViewsChartComponent
} from './views-chart';

describe(
  'ViewsChartComponent',
  () => {

    let component: ViewsChartComponent;

    let fixture:
      ComponentFixture<ViewsChartComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ViewsChartComponent
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          ViewsChartComponent
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
        expect(component.monthlyViews.length)
          .toBe(6);
      }
    );

    it(
      'should generate chart points',
      () => {
        expect(component.chartPoints.length)
          .toBeGreaterThan(0);
      }
    );

    it(
      'should find maximum value',
      () => {
        expect(component.maximumValue)
          .toBe(112);
      }
    );
  }
);
