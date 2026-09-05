import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService, RecentAuthorRequestItem } from '../../../../../core/services/admin-api.service';

@Component({
  selector: 'app-recent-requests',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './recent-requests.html',
  styleUrl: './recent-requests.scss',
})
export class RecentRequests implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  @Input() searchQuery = '';
  @Input() filterTimeframe = 'all';

  readonly requests = signal<RecentAuthorRequestItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.adminApi.getDashboardRecent().subscribe({
      next: (data) => {
        this.requests.set(data.pending_author_requests ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  get filteredRequests(): RecentAuthorRequestItem[] {
    const q = this.searchQuery.toLowerCase().trim();
    const timeframe = this.filterTimeframe;
    const now = new Date().getTime();

    return this.requests().filter(r => {
      const matchesSearch = !q ||
        r.full_name.toLowerCase().includes(q) ||
        r.pen_name.toLowerCase().includes(q) ||
        (r.country && r.country.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (!r.created_at || timeframe === 'all') return true;

      const dateMs = new Date(r.created_at).getTime();
      const diffHours = (now - dateMs) / (1000 * 60 * 60);

      if (timeframe === 'today') return diffHours <= 24;
      if (timeframe === '7days') return diffHours <= 24 * 7;
      if (timeframe === '30days') return diffHours <= 24 * 30;

      return true;
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
  }
}
