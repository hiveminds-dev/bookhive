import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  OurMission
} from './our-mission';

describe(
  'OurMission',
  () => {

    let component: OurMission;

    let fixture:
      ComponentFixture<OurMission>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          OurMission
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          OurMission
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain three mission items',
      () => {
        expect(
          component.missionItems.length
        ).toBe(3);
      }
    );

    it(
      'should include reading mission',
      () => {
        expect(
          component.missionItems[0].title
        ).toBe('Read');
      }
    );
  }
);
