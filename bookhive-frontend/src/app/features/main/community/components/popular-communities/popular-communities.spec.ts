import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  PopularCommunities
} from './popular-communities';

describe('PopularCommunities', () => {

  let component:
    PopularCommunities;

  let fixture:
    ComponentFixture<PopularCommunities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PopularCommunities
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        PopularCommunities
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should contain six communities',
    () => {
      expect(
        component.communities.length
      ).toBe(6);
    }
  );

  it(
    'should render community cards',
    () => {
      const cards:
        NodeListOf<HTMLElement> =
        fixture.nativeElement.querySelectorAll(
          '.community-card'
        );

      expect(cards.length).toBe(6);
    }
  );

  it(
    'should emit selected community',
    () => {
      let selectedId = 0;

      component.communityJoined
        .subscribe(community => {
          selectedId = community.id;
        });

      component.joinCommunity(
        component.communities[0]
      );

      expect(selectedId).toBe(1);
    }
  );

  it(
    'should emit view all event',
    () => {
      let emitted = false;

      component.viewAll
        .subscribe(() => {
          emitted = true;
        });

      component.onViewAll();

      expect(emitted).toBe(true);
    }
  );
});
