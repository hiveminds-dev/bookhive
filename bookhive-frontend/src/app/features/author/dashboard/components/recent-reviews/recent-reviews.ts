import { Component, Input } from '@angular/core';

export interface AuthorRecentReview {
  id: number;
  readerName: string;
  readerInitials: string;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-recent-reviews',
  standalone: true,
  imports: [],
  templateUrl: './recent-reviews.html',
  styleUrl: './recent-reviews.scss'
})
export class RecentReviewsComponent {

  @Input() averageRating = 0;
  @Input() reviews: AuthorRecentReview[] = [];

  readonly stars = [1, 2, 3, 4, 5];
}
