import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { LucideBook, LucideUser, LucidePenLine, LucideCheck, LucideEye, LucideSearch, LucideX, LucideFilter, LucideStar, LucideDownload, LucideCalendar } from '@lucide/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AdminApiService, PlatformStatistics } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule, LucideBook, LucideUser, LucidePenLine, LucideCheck, LucideEye, LucideSearch, LucideX, LucideFilter, LucideStar, LucideDownload, LucideCalendar],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class AdminStatisticsComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApiService);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterMetric = signal('');
  filterTimeframe = signal('30days');

  readonly statsSignal = signal<PlatformStatistics | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading.set(true);
    this.adminApi.getPlatformStatistics().subscribe({
      next: (data) => {
        this.statsSignal.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.info('Could not load dynamic platform statistics.', 'Notice');
        this.loading.set(false);
      }
    });
  }

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  applyFilters(): void {
    this.loadStatistics();
    this.toastService.success('Applied metric search & analytics filters.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterMetric.set('');
    this.filterTimeframe.set('30days');
    this.loadStatistics();
    this.toastService.info('Analytics filters reset.', 'Filters Reset');
  }

  exportPDF(): void {
    this.toastService.success('Generating performance overview PDF export...', 'Export PDF');
  }

  filterDateRange(): void {
    this.toastService.info('Filtering analytics for Last 30 Days.', 'Filter Date');
  }
}
