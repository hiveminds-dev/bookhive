import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  AuthorBookItem,
  BookService
} from '../../../core/services/book.service';

import {
  ToastService
} from '../../../core/services/toast.service';

import {
  AnalyticsHeaderComponent
} from './components/analytics-header/analytics-header';

import {
  AnalyticsStatistic,
  StatisticsComponent
} from './components/statistics/statistics';

import {
  ViewsChartComponent
} from './components/views-chart/views-chart';

import {
  ReadersChartComponent
} from './components/readers-chart/readers-chart';

import {
  TopBooksComponent
} from './components/top-books/top-books';

import {
  BookPerformanceComponent
} from './components/book-performance/book-performance';

@Component({
  selector: 'app-author-analytics',
  standalone: true,
  imports: [
    AnalyticsHeaderComponent,
    StatisticsComponent,
    ViewsChartComponent,
    ReadersChartComponent,
    TopBooksComponent,
    BookPerformanceComponent
  ],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class AnalyticsComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly toastService = inject(ToastService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  private books: AuthorBookItem[] = [];

  statistics: AnalyticsStatistic[] = [
    {
      id: 1,
      icon: 'views',
      title: 'Total Views',
      value: '0',
      badge: 'Not tracked',
      badgeType: 'neutral',
      iconType: 'gold'
    },
    {
      id: 2,
      icon: 'downloads',
      title: 'Total Downloads',
      value: '0',
      badge: 'Not tracked',
      badgeType: 'neutral',
      iconType: 'gold'
    },
    {
      id: 3,
      icon: 'books',
      title: 'Books Published',
      value: '0',
      badge: 'From your books',
      badgeType: 'neutral',
      iconType: 'gray'
    },
    {
      id: 4,
      icon: 'rating',
      title: 'Average Rating',
      value: '0.0',
      secondaryValue: '/ 5.0',
      badge: 'No reviews yet',
      badgeType: 'neutral',
      iconType: 'yellow'
    }
  ];

  ngOnInit(): void {
    this.bookService.getAuthorBooks().subscribe({
      next: (books) => {
        this.books = books;
        const publishedCount = books.filter(
          (book) => book.status.toUpperCase() === 'PUBLISHED'
        ).length;

        this.statistics = this.statistics.map((statistic) =>
          statistic.title === 'Books Published'
            ? { ...statistic, value: String(publishedCount) }
            : statistic
        );
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.toastService.warning('Failed to load author analytics.', 'Notice');
        this.changeDetector.markForCheck();
      }
    });
  }

  exportAnalyticsReport(): void {
    const report = [
      'BookHive Author Analytics Report',
      '',
      'Total Views,0',
      'Total Downloads,0',
      `Books Published,${this.books.filter((book) => book.status.toUpperCase() === 'PUBLISHED').length}`,
      'Average Rating,0.0/5.0'
    ].join('\n');

    const blob = new Blob(
      [report],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

    const downloadUrl =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = downloadUrl;
    anchor.download =
      'bookhive-author-analytics.csv';

    anchor.click();

    URL.revokeObjectURL(downloadUrl);
  }

  goToBooks(): void {
    this.router.navigate([
      '/author/books'
    ]);
  }

  downloadReports(): void {
    this.exportAnalyticsReport();
  }
}
