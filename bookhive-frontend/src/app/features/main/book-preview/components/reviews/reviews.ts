import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ReaderReview {
  id: number;
  readerName: string;
  readerImage?: string;
  rating: number;
  date: string;
  comment: string;
  helpfulCount: number;
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

  @Output() writeReview = new EventEmitter<void>();
  @Output() helpfulSelected = new EventEmitter<ReaderReview>();

  onWriteReview(): void {
    this.writeReview.emit();
  }

  onHelpful(review: ReaderReview): void {
    review.helpfulCount += 1;
    this.helpfulSelected.emit(review);
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }
}
