import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  AdminApiService,
  DashboardRecent,
  DashboardStats,
  RecentAuthorRequestItem,
  RecentBookItem,
  RecentReaderItem,
} from '../../../../../core/services/admin-api.service';
import {
  LucideBook,
  LucideUsers,
  LucidePenLine,
  LucideInbox,
  LucideShieldCheck,
  LucideUserCog,
} from '@lucide/angular';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [NgFor, NgIf, LucideBook, LucideUsers, LucidePenLine, LucideInbox, LucideShieldCheck, LucideUserCog],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class Statistics implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  @Input() isSuperAdmin = false;
  @Input() isFiltered = false;
  @Input() searchQuery = '';
  @Input() filterTimeframe = 'all';

  readonly stats = signal<DashboardStats>({
    total_books: 0,
    total_readers: 0,
    total_authors: 0,
    total_admins: 0,
    book_requests: 0,
    author_requests: 0,
  });
  readonly recent = signal<DashboardRecent>({
    recent_books: [],
    recent_readers: [],
    pending_author_requests: [],
  });

  ngOnInit(): void {
    this.adminApi.getDashboardStats().subscribe({
      next: (data) => {
        if (data) {
          this.stats.set(data);
        }
      },
      error: () => {
        // Fallback to initial signals if offline
      }
    });

    this.adminApi.getDashboardRecent().subscribe({
      next: (data) => {
        this.recent.set({
          recent_books: data.recent_books ?? [],
          recent_readers: data.recent_readers ?? [],
          pending_author_requests: data.pending_author_requests ?? [],
        });
      },
      error: () => {
        // Keep filtered snapshot empty if recent dashboard data is unavailable.
      }
    });
  }

  get cards() {
    const s = this.stats();

    if (this.isFiltered) {
      const snapshotCards = [
        {
          iconName: 'lucideBook',
          label: 'Matching Books',
          value: this.filteredBooks.length.toLocaleString(),
        },
        {
          iconName: 'lucideUsers',
          label: 'Reader Registrations',
          value: this.filteredReaders.length.toLocaleString(),
        },
        {
          iconName: 'lucideShieldCheck',
          label: 'Author Requests',
          value: this.filteredAuthorRequests.length.toLocaleString(),
        },
      ];

      if (this.isSuperAdmin) {
        snapshotCards.push({
          iconName: 'lucideUserCog',
          label: 'Total Admins',
          value: s.total_admins.toLocaleString(),
        });
      }

      return snapshotCards;
    }

    const base = [
      { iconName: 'lucideBook', label: 'Total Books', value: s.total_books.toLocaleString() },
      { iconName: 'lucideUsers', label: 'Total Readers', value: s.total_readers.toLocaleString() },
      { iconName: 'lucidePenLine', label: 'Total Authors', value: s.total_authors.toLocaleString() },
      { iconName: 'lucideInbox', label: 'Book Requests', value: s.book_requests.toString() },
      { iconName: 'lucideShieldCheck', label: 'Author Requests', value: s.author_requests.toString() },
    ];

    if (this.isSuperAdmin) {
      base.push({
        iconName: 'lucideUserCog',
        label: 'Total Admins',
        value: s.total_admins.toLocaleString(),
      });
    }

    return base;
  }

  private get filteredBooks(): RecentBookItem[] {
    const q = this.normalizedSearchQuery;

    return this.recent().recent_books.filter(book =>
      this.matchesDate(book.created_at) &&
      (
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author_name.toLowerCase().includes(q) ||
        book.category_name.toLowerCase().includes(q)
      )
    );
  }

  private get filteredReaders(): RecentReaderItem[] {
    const q = this.normalizedSearchQuery;

    return this.recent().recent_readers.filter(reader =>
      this.matchesDate(reader.joined_at) &&
      (
        !q ||
        reader.full_name.toLowerCase().includes(q) ||
        reader.username.toLowerCase().includes(q)
      )
    );
  }

  private get filteredAuthorRequests(): RecentAuthorRequestItem[] {
    const q = this.normalizedSearchQuery;

    return this.recent().pending_author_requests.filter(request =>
      this.matchesDate(request.created_at) &&
      (
        !q ||
        request.full_name.toLowerCase().includes(q) ||
        request.pen_name.toLowerCase().includes(q) ||
        (request.country?.toLowerCase().includes(q) ?? false)
      )
    );
  }

  private get normalizedSearchQuery(): string {
    return this.searchQuery.toLowerCase().trim();
  }

  private matchesDate(value?: string | null): boolean {
    if (!value || this.filterTimeframe === 'all') {
      return true;
    }

    const dateMs = new Date(value).getTime();
    if (Number.isNaN(dateMs)) {
      return false;
    }

    const diffHours = (Date.now() - dateMs) / (1000 * 60 * 60);

    if (this.filterTimeframe === 'today') return diffHours <= 24;
    if (this.filterTimeframe === '7days') return diffHours <= 24 * 7;
    if (this.filterTimeframe === '30days') return diffHours <= 24 * 30;

    return true;
  }
}
