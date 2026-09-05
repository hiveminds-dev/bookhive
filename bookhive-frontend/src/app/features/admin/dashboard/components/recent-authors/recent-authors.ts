import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService, RecentReaderItem } from '../../../../../core/services/admin-api.service';

@Component({
  selector: 'app-recent-authors',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './recent-authors.html',
  styleUrl: './recent-authors.scss',
})
export class RecentAuthors implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  @Input() searchQuery = '';
  @Input() filterTimeframe = 'all';

  readonly readers = signal<RecentReaderItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.adminApi.getDashboardRecent().subscribe({
      next: (data) => {
        this.readers.set(data.recent_readers ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  get filteredReaders(): RecentReaderItem[] {
    const q = this.searchQuery.toLowerCase().trim();
    const timeframe = this.filterTimeframe;
    const now = new Date().getTime();

    return this.readers().filter(r => {
      const matchesSearch = !q ||
        r.full_name.toLowerCase().includes(q) ||
        r.username.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (!r.joined_at || timeframe === 'all') return true;

      const dateMs = new Date(r.joined_at).getTime();
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

  getJoinedLabel(joinedAt: string): string {
    const date = new Date(joinedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 24) return `Joined ${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `Joined ${diffD}d ago`;
    return `Joined ${date.toLocaleDateString()}`;
  }
}
