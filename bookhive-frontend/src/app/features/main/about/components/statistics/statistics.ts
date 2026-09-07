import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import {
  retry
} from 'rxjs';

import {
  BookService,
  PublicCatalogueStatistics
} from '../../../../../core/services/book.service';

export interface AboutStatistic {
  id: number;
  value: string;
  label: string;
}

@Component({
  selector: 'app-about-statistics',
  standalone: true,
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss'
})
export class Statistics implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  statistics: AboutStatistic[] = [
    {
      id: 1,
      value: '—',
      label: 'Books'
    },
    {
      id: 2,
      value: '—',
      label: 'Authors'
    },
    {
      id: 3,
      value: '—',
      label: 'Readers'
    },
    {
      id: 4,
      value: '—',
      label: 'Downloads'
    }
  ];

  ngOnInit(): void {
    this.bookService.getCatalogueStatistics().pipe(
      retry({
        count: 2,
        delay: 500,
      })
    ).subscribe({
      next: (stats) => {
        this.statistics = this.mapStatistics(stats);
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.statistics = this.createUnavailableStatistics();
        this.changeDetector.markForCheck();
      },
    });
  }

  private mapStatistics(stats: PublicCatalogueStatistics): AboutStatistic[] {
    return [
      {
        id: 1,
        value: this.formatCount(stats.total_books),
        label: 'Books'
      },
      {
        id: 2,
        value: this.formatCount(stats.total_authors),
        label: 'Authors'
      },
      {
        id: 3,
        value: this.formatCount(stats.total_readers),
        label: 'Readers'
      },
      {
        id: 4,
        value: this.formatCount(stats.total_downloads),
        label: 'Downloads'
      }
    ];
  }

  private formatCount(value: number): string {
    return value.toLocaleString();
  }

  private createUnavailableStatistics(): AboutStatistic[] {
    return [
      {
        id: 1,
        value: '—',
        label: 'Books'
      },
      {
        id: 2,
        value: '—',
        label: 'Authors'
      },
      {
        id: 3,
        value: '—',
        label: 'Readers'
      },
      {
        id: 4,
        value: '—',
        label: 'Downloads'
      }
    ];
  }
}
