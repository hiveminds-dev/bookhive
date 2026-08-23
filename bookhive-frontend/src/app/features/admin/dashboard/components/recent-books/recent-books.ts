import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AdminApiService, RecentBookItem } from '../../../../../core/services/admin-api.service';

@Component({
  selector: 'app-recent-books',
  imports: [NgFor, NgIf],
  templateUrl: './recent-books.html',
  styleUrl: './recent-books.scss',
})
export class RecentBooks implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  @Input() searchQuery = '';
  @Input() filterTimeframe = 'all';

  readonly books = signal<RecentBookItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.adminApi.getDashboardRecent().subscribe({
      next: (data) => {
        this.books.set(data.recent_books ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  get filteredBooks(): RecentBookItem[] {
    const q = this.searchQuery.toLowerCase().trim();
    const timeframe = this.filterTimeframe;
    const now = new Date().getTime();

    return this.books().filter(b => {
      const matchesSearch = !q ||
        b.title.toLowerCase().includes(q) ||
        b.author_name.toLowerCase().includes(q) ||
        b.category_name.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (!b.created_at || timeframe === 'all') return true;

      const dateMs = new Date(b.created_at).getTime();
      const diffHours = (now - dateMs) / (1000 * 60 * 60);

      if (timeframe === 'today') return diffHours <= 24;
      if (timeframe === '7days') return diffHours <= 24 * 7;
      if (timeframe === '30days') return diffHours <= 24 * 30;

      return true;
    });
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PUBLISHED': return 'published';
      case 'PENDING_REVIEW': return 'review';
      case 'REJECTED': return 'rejected';
      default: return 'draft';
    }
  }

  getStatusLabel(status: string): string {
    switch (status.toUpperCase()) {
      case 'PUBLISHED': return 'Published';
      case 'PENDING_REVIEW': return 'Under Review';
      case 'REJECTED': return 'Rejected';
      default: return 'Draft';
    }
  }
}

