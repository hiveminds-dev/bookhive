import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  WelcomeSectionComponent
} from './components/welcome-section/welcome-section';

import {
  AuthorStatistic,
  StatisticsComponent
} from './components/statistics/statistics';

import {
  RecentAuthorBook,
  RecentBooksComponent
} from './components/recent-books/recent-books';

import {
  AuthorRecentReview,
  RecentReviewsComponent
} from './components/recent-reviews/recent-reviews';

import {
  AuthorActivity,
  RecentActivityComponent
} from './components/recent-activity/recent-activity';

@Component({
  selector: 'app-author-dashboard',
  standalone: true,
  imports: [
    WelcomeSectionComponent,
    StatisticsComponent,
    RecentBooksComponent,
    RecentReviewsComponent,
    RecentActivityComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class AuthorDashboardComponent {

  private readonly router = inject(Router);

  readonly authorFirstName = 'Julian';

  statistics: AuthorStatistic[] = [
    {
      id: 1,
      label: 'Total Books',
      value: '12',
      icon: '▤',
      indicator: '↗ +2',
      tone: 'gold'
    },
    {
      id: 2,
      label: 'Published Books',
      value: '8',
      icon: '✺',
      indicator: '◎ Stable',
      tone: 'green'
    },
    {
      id: 3,
      label: 'Pending Approval',
      value: '4',
      icon: '⌛',
      indicator: '! Action',
      tone: 'red'
    },
    {
      id: 4,
      label: 'Total Downloads',
      value: '2.4K',
      icon: '⇩',
      indicator: '↗ 14%',
      tone: 'neutral'
    }
  ];

  recentBooks: RecentAuthorBook[] = [
    {
      id: 1,
      title: 'The Silent Anchor',
      cover: 'images/author-books/silent-anchor.jpg',
      uploadedDate: 'Oct 24, 2024',
      status: 'Published'
    },
    {
      id: 2,
      title: 'Linear Spaces',
      cover: 'images/author-books/linear-spaces.jpg',
      uploadedDate: 'Oct 12, 2024',
      status: 'Pending'
    },
    {
      id: 3,
      title: 'Echoes of Gold',
      cover: 'images/author-books/echoes-of-gold.jpg',
      uploadedDate: 'Sep 28, 2024',
      status: 'Published'
    }
  ];

  recentReviews: AuthorRecentReview[] = [
    {
      id: 1,
      readerName: 'Eleanor Wright',
      readerInitials: 'EW',
      rating: 5,
      comment:
        'An absolute masterpiece in narrative structure. The development of the protagonist in The Silent Anchor kept me engaged until the very last page.'
    },
    {
      id: 2,
      readerName: 'Marcus Kane',
      readerInitials: 'MK',
      rating: 4,
      comment:
        'Sharp, insightful, and beautifully written. Julian’s work continues to push the boundaries of modern non-fiction.'
    }
  ];

  activities: AuthorActivity[] = [
    {
      id: 1,
      title: 'Book approved: "Echoes of Gold"',
      description:
        'Congratulations! Your manuscript has passed the final editorial review and is now live.',
      time: '2 hours ago',
      type: 'approved'
    },
    {
      id: 2,
      title: 'New review received',
      description:
        'Eleanor Wright left a 5-star review on "The Silent Anchor".',
      time: '5 hours ago',
      type: 'review'
    },
    {
      id: 3,
      title: 'Monthly report ready',
      description:
        'Your October earnings and download analytics report is now available for download.',
      time: 'Yesterday, 10:45 AM',
      type: 'report'
    }
  ];

  goToUploadBook(): void {
    this.router.navigate(['/author/books/upload']);
  }

  goToAllBooks(): void {
    this.router.navigate(['/author/books']);
  }

  openBook(book: RecentAuthorBook): void {
    this.router.navigate(['/author/books'], {
      queryParams: {
        selectedBook: book.id
      }
    });
  }
}
