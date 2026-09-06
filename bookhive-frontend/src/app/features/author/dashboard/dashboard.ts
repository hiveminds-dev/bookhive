import { ChangeDetectorRef, Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { AuthorBookItem, BookService } from '../../../core/services/book.service';
import { ToastService } from '../../../core/services/toast.service';

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
export class AuthorDashboardComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  private readonly bookService = inject(BookService);
  private readonly toastService = inject(ToastService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly currentUser = this.auth.currentUser;

  readonly authorFirstName = computed(() => {
    const user = this.currentUser();
    if (!user?.full_name) {
      return 'Author';
    }
    return user.full_name.trim().split(/\s+/)[0] || 'Author';
  });

  statistics: AuthorStatistic[] = [
    {
      id: 1,
      label: 'Total Books',
      value: '0',
      icon: 'books',
      indicator: 'Current',
      tone: 'gold'
    },
    {
      id: 2,
      label: 'Published Books',
      value: '0',
      icon: 'published',
      indicator: 'Stable',
      tone: 'green'
    },
    {
      id: 3,
      label: 'Pending Approval',
      value: '0',
      icon: 'pending',
      indicator: 'Action',
      tone: 'red'
    },
    {
      id: 4,
      label: 'Total Downloads',
      value: '—',
      icon: 'downloads',
      indicator: 'Not tracked',
      tone: 'neutral'
    }
  ];

  recentBooks: RecentAuthorBook[] = [];

  recentReviews: AuthorRecentReview[] = [];

  activities: AuthorActivity[] = [];

  ngOnInit(): void {
    this.bookService.getAuthorBooks().subscribe({
      next: (books) => {
        const published = books.filter((book) => book.status.toUpperCase() === 'PUBLISHED').length;
        const pending = books.filter((book) =>
          ['PENDING', 'PENDING_REVIEW'].includes(book.status.toUpperCase())
        ).length;

        this.statistics = [
          { ...this.statistics[0], value: String(books.length) },
          { ...this.statistics[1], value: String(published) },
          { ...this.statistics[2], value: String(pending) },
          this.statistics[3]
        ];
        this.recentBooks = [...books]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
          .map((book) => this.mapRecentBook(book));
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.toastService.warning('Failed to load the author dashboard.', 'Notice');
        this.changeDetector.markForCheck();
      }
    });
  }

  private mapRecentBook(book: AuthorBookItem): RecentAuthorBook {
    const rawStatus = book.status.toUpperCase();
    const status = rawStatus === 'PUBLISHED'
      ? 'Published'
      : ['PENDING', 'PENDING_REVIEW'].includes(rawStatus)
        ? 'Pending'
        : rawStatus === 'REJECTED'
          ? 'Rejected'
          : 'Draft';

    return {
      id: book.id,
      title: book.title,
      cover: book.cover_url || 'images/author-books/default-cover.jpg',
      uploadedDate: new Date(book.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      status
    };
  }

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
