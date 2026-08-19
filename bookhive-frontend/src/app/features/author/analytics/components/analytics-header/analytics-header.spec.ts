import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  AnalyticsHeaderComponent
} from './analytics-header';

describe(
  'AnalyticsHeaderComponent',
  () => {

    let component:
      AnalyticsHeaderComponent;

    let fixture:
      ComponentFixture<AnalyticsHeaderComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          AnalyticsHeaderComponent
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          AnalyticsHeaderComponent
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should emit export event', () => {
      let eventEmitted = false;

      component.exportSelected.subscribe(
        () => {
          eventEmitted = true;
        }
      );

      component.exportReport();

      expect(eventEmitted).toBe(true);
    });
  }
);
