import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  CommunityCta
} from './community-cta';

describe('CommunityCta', () => {

  let component:
    CommunityCta;

  let fixture:
    ComponentFixture<CommunityCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommunityCta
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        CommunityCta
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should display the CTA title',
    () => {
      const heading:
        HTMLHeadingElement | null =
        fixture.nativeElement.querySelector(
          'h2'
        );

      expect(
        heading?.textContent
      ).toContain(
        'Passionate Readers'
      );
    }
  );

  it(
    'should emit join community event',
    () => {
      let emitted = false;

      component.joinCommunity
        .subscribe(() => {
          emitted = true;
        });

      component.onJoinCommunity();

      expect(emitted).toBe(true);
    }
  );

  it(
    'should emit explore books event',
    () => {
      let emitted = false;

      component.exploreBooks
        .subscribe(() => {
          emitted = true;
        });

      component.onExploreBooks();

      expect(emitted).toBe(true);
    }
  );
});
