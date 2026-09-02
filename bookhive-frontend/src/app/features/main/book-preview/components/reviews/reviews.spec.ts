import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  ReaderReview,
  ReviewsComponent
} from './reviews';

describe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;

  const testReview: ReaderReview = {
    id: 1,
    readerName: 'Anonymous Reader',
    rating: 5,
    date: 'August 15, 2026',
    comment: 'A fascinating book with clear explanations.',
    helpfulCount: 12
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsComponent);
    component = fixture.componentInstance;
    component.reviews = [{ ...testReview }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the reader reviews', () => {
    expect(component.reviews.length).toBe(1);
  });

  it('should increase the helpful count', () => {
    component.onHelpful(component.reviews[0]);

    expect(component.reviews[0].helpfulCount).toBe(13);
  });

  it('should create five stars', () => {
    expect(component.getStars(5).length).toBe(5);
  });

  it('should emit editReview event when onEditReview is called', () => {
    const editSpy = vi.spyOn(component.editReview, 'emit');
    component.onEditReview(component.reviews[0]);
    expect(editSpy).toHaveBeenCalledWith(component.reviews[0]);
  });

  it('should emit deleteReview event when onDeleteReview is called', () => {
    const deleteSpy = vi.spyOn(component.deleteReview, 'emit');
    component.onDeleteReview(1);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
