import { Component, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  private readonly toastService = inject(ToastService);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterSection = signal('');
  filterTimeframe = signal('today');

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  applyFilters(): void {
    this.toastService.success('Dashboard global search filter applied.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterSection.set('');
    this.filterTimeframe.set('today');
    this.toastService.info('Dashboard search filters reset.', 'Filters Reset');
  }
}
