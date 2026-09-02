import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ReaderReview {
  id: number;
  userId?: number;
  readerName: string;
  readerImage?: string;
  rating: number;
  date: string;
  comment: string;
  helpfulCount: number;
  isOwnReview?: boolean;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss'
})
export class ReviewsComponent {
  @Input() reviews: ReaderReview[] = [];
  @Input() currentUserId?: number;
  @Input() hasUserReviewed = false;

  @Output() writeReview = new EventEmitter<void>();
  @Output() editReview = new EventEmitter<ReaderReview>();
  @Output() deleteReview = new EventEmitter<number>();
  @Output() helpfulSelected = new EventEmitter<ReaderReview>();

  onWriteReview(): void {
    this.writeReview.emit();
  }

  onEditReview(review: ReaderReview): void {
    this.editReview.emit(review);
  }

  onDeleteReview(reviewId: number): void {
    this.deleteReview.emit(reviewId);
  }

  onHelpful(review: ReaderReview): void {
    review.helpfulCount += 1;
    this.helpfulSelected.emit(review);
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }
}
