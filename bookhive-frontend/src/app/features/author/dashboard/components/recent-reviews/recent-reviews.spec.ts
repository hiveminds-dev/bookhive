import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  AuthorRecentReview,
  RecentReviewsComponent
} from './recent-reviews';

describe('RecentReviewsComponent', () => {
  let component: RecentReviewsComponent;
  let fixture: ComponentFixture<RecentReviewsComponent>;

  const testReview: AuthorRecentReview = {
    id: 1,
    readerName: 'Eleanor Wright',
    readerInitials: 'EW',
    rating: 5,
    comment:
      'An absolute masterpiece in narrative structure.'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentReviewsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      RecentReviewsComponent
    );

    component = fixture.componentInstance;
    component.averageRating = 4.8;
    component.reviews = [testReview];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the average rating', () => {
    expect(component.averageRating).toBe(4.8);
  });

  it('should receive recent reviews', () => {
    expect(component.reviews.length).toBe(1);
  });

  it('should contain five display stars', () => {
    expect(component.stars.length).toBe(5);
  });
});
