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

  it('should filter discussions by title, author, or tag', () => {
    component.searchTerm = 'AI-assisted';
    expect(component.filteredDiscussions.length).toBe(1);
    expect(component.filteredDiscussions[0].id).toBe(2);

    component.searchTerm = 'SinhalaLiterature';
    expect(component.filteredDiscussions.length).toBe(1);
    expect(component.filteredDiscussions[0].id).toBe(1);
  });

  it('should return no discussions for an unmatched search', () => {
    fixture.componentRef.setInput(
      'searchTerm',
      'no matching discussion'
    );
    fixture.detectChanges();

    expect(component.filteredDiscussions).toEqual([]);
    expect(
      fixture.nativeElement.querySelector('.empty-state')?.textContent
    ).toContain('No discussions match');
  });
});
