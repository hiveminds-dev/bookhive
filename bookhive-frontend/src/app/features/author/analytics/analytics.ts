import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  AnalyticsHeaderComponent
} from './components/analytics-header/analytics-header';

import {
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
export class AnalyticsComponent {

  private readonly router = inject(Router);

  exportAnalyticsReport(): void {
    const report = [
      'BookHive Author Analytics Report',
      '',
      'Total Views,0',
      'Total Downloads,42.2K',
      'Books Published,0',
      'Average Rating,4.8/5.0'
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
