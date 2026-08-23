import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  Community
} from './community';

describe('Community', () => {

  let component:
    Community;

  let fixture:
    ComponentFixture<Community>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Community
      ],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        Community
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    component.closeNotification();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should update search term',
    () => {
      component.onSearchChanged(
        'Angular'
      );

      expect(
        component.searchTerm
      ).toBe('Angular');
    }
  );

  it(
    'should show start discussion message',
    () => {
      component.onStartDiscussion();

      expect(
        component.notificationMessage
      ).toContain(
        'Start Discussion'
      );
    }
  );

  it(
    'should close notification',
    () => {
      component.onStartDiscussion();

      component.closeNotification();

      expect(
        component.notificationMessage
      ).toBe('');
    }
  );

  it(
    'should render main components',
    () => {
      const element:
        HTMLElement =
        fixture.nativeElement;

      expect(
        element.querySelector(
          'app-community-hero'
        )
      ).toBeTruthy();

      expect(
        element.querySelector(
          'app-popular-communities'
        )
      ).toBeTruthy();

      expect(
        element.querySelector(
          'app-community-cta'
        )
      ).toBeTruthy();
    }
  );
});
