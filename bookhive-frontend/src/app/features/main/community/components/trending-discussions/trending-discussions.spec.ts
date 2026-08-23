import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  TrendingDiscussions
} from './trending-discussions';

describe('TrendingDiscussions', () => {

  let component:
    TrendingDiscussions;

  let fixture:
    ComponentFixture<TrendingDiscussions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TrendingDiscussions
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        TrendingDiscussions
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should contain two discussions',
    () => {
      expect(
        component.discussions.length
      ).toBe(2);
    }
  );

  it(
    'should render discussion cards',
    () => {
      const cards:
        NodeListOf<HTMLElement> =
        fixture.nativeElement.querySelectorAll(
          '.discussion-card'
        );

      expect(cards.length).toBe(2);
    }
  );

  it(
    'should emit selected discussion',
    () => {
      let selectedId = 0;

      component.threadSelected
        .subscribe(discussion => {
          selectedId =
            discussion.id;
        });

      component.viewThread(
        component.discussions[0]
      );

      expect(selectedId).toBe(1);
    }
  );

  it(
    'should increase likes',
    () => {
      const discussion =
        component.discussions[0];

      const previousLikes =
        discussion.likes;

      component.likeDiscussion(
        discussion
      );

      expect(
        discussion.likes
      ).toBe(previousLikes + 1);
    }
  );
});
