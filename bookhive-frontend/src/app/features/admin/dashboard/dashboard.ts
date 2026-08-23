import { Component, computed, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast.service';
import { Activity } from './components/activity/activity';
import { RecentAuthors } from './components/recent-authors/recent-authors';
import { RecentBooks } from './components/recent-books/recent-books';
import { RecentRequests } from './components/recent-requests/recent-requests';
import { Statistics } from './components/statistics/statistics';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Statistics, RecentBooks, RecentAuthors, RecentRequests, Activity, NgIf, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly auth = inject(Auth);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  private readonly user = this.auth.currentUser;

  readonly isSuperAdmin = computed(() => this.user()?.role === 'super_admin');

  readonly pageTitle = computed(() =>
    this.isSuperAdmin()
      ? 'Super Admin Command Center'
      : 'Curator Dashboard Overview'
  );

  readonly pageSubtitle = computed(() =>
    this.isSuperAdmin()
      ? 'Full platform oversight — admin accounts, system health, content governance, and all activity logs.'
      : 'Monitor platform statistics, pending manuscripts, author credentials, and system health.'
  );

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterTimeframe = signal('all');
  filterSortBy = signal('newest');

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  applyFilters(): void {
    this.toastService.success('Dashboard filters applied.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterTimeframe.set('all');
    this.filterSortBy.set('newest');
    this.toastService.info('Dashboard search filters reset.', 'Filters Reset');
  }
}
