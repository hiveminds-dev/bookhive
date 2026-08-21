import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  AnalyticsComponent
} from './analytics';

describe(
  'AnalyticsComponent',
  () => {

    let component: AnalyticsComponent;

    let fixture:
      ComponentFixture<AnalyticsComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          AnalyticsComponent
        ],
        providers: [
          provideRouter([])
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          AnalyticsComponent
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  }
);
