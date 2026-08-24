import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  CommunityHero
} from './community-hero';

describe('CommunityHero', () => {

  let component: CommunityHero;

  let fixture:
    ComponentFixture<CommunityHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommunityHero
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        CommunityHero
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should display the community heading',
    () => {
      const element:
        HTMLElement =
        fixture.nativeElement;

      const heading =
        element.querySelector('h1');

      expect(
        heading?.textContent
      ).toContain(
        'BookHive'
      );

      expect(
        heading?.textContent
      ).toContain(
        'Community'
      );
    }
  );

  it(
    'should emit startDiscussion',
    () => {
      let emitted = false;

      component.startDiscussion
        .subscribe(() => {
          emitted = true;
        });

      component.onStartDiscussion();

      expect(emitted).toBe(true);
    }
  );

  it(
    'should emit browseCommunities',
    () => {
      let emitted = false;

      component.browseCommunities
        .subscribe(() => {
          emitted = true;
        });

      component.onBrowseCommunities();

      expect(emitted).toBe(true);
    }
  );

  it(
    'should emit event when start button is clicked',
    () => {
      let emitted = false;

      component.startDiscussion
        .subscribe(() => {
          emitted = true;
        });

      const button:
        HTMLButtonElement | null =
        fixture.nativeElement.querySelector(
          '.primary-button'
        );

      button?.click();

      expect(emitted).toBe(true);
    }
  );

  it(
    'should emit event when browse button is clicked',
    () => {
      let emitted = false;

      component.browseCommunities
        .subscribe(() => {
          emitted = true;
        });

      const button:
        HTMLButtonElement | null =
        fixture.nativeElement.querySelector(
          '.secondary-button'
        );

      button?.click();

      expect(emitted).toBe(true);
    }
  );
});
