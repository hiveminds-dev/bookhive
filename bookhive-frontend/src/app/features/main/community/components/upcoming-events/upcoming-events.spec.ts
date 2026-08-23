import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  UpcomingEvents
} from './upcoming-events';

describe('UpcomingEvents', () => {

  let component:
    UpcomingEvents;

  let fixture:
    ComponentFixture<UpcomingEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UpcomingEvents
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        UpcomingEvents
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should contain two events',
    () => {
      expect(
        component.events.length
      ).toBe(2);
    }
  );

  it(
    'should render two event cards',
    () => {
      const cards:
        NodeListOf<HTMLElement> =
        fixture.nativeElement.querySelectorAll(
          '.event-card'
        );

      expect(cards.length).toBe(2);
    }
  );

  it(
    'should emit selected event',
    () => {
      let selectedId = 0;

      component.eventSelected
        .subscribe(event => {
          selectedId = event.id;
        });

      component.selectEvent(
        component.events[0]
      );

      expect(selectedId).toBe(1);
    }
  );
});
