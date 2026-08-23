import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AdminApiService, AuthorApplicationItem } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink, FormsModule],
  templateUrl: './authors.html',
  styleUrl: './authors.scss',
})
export class AuthorsComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApiService);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterCountry = signal('');
  filterStatus = signal('');
  filterTimeframe = signal('all');
  filterSortBy = signal('newest');

  readonly authorsSignal = signal<AuthorApplicationItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors(): void {
    const status = this.filterStatus() || undefined;
    this.loading.set(true);
    this.adminApi.getAuthorApplications(status).subscribe({
      next: (data) => {
        this.authorsSignal.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.info('Could not load author list — check your connection.', 'Notice');
        this.loading.set(false);
      }
    });
  }

  get filteredAuthors(): AuthorApplicationItem[] {
    const q = this.searchQuery().toLowerCase().trim();
    const country = this.filterCountry().toLowerCase().trim();
    const timeframe = this.filterTimeframe();
    const sortBy = this.filterSortBy();
    const now = new Date().getTime();

    let list = this.authorsSignal().filter(a => {
      const matchesSearch = !q ||
        a.full_name.toLowerCase().includes(q) ||
        a.pen_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const matchesCountry = !country || (a.country && a.country.toLowerCase().includes(country));
      if (!matchesCountry) return false;

      if (!a.applied_date || timeframe === 'all') return true;
      const dateMs = new Date(a.applied_date).getTime();
      const diffHours = (now - dateMs) / (1000 * 60 * 60);

      if (timeframe === 'today') return diffHours <= 24;
      if (timeframe === '7days') return diffHours <= 24 * 7;
      if (timeframe === '30days') return diffHours <= 24 * 30;

      return true;
    });

    if (sortBy === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime());
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else {
      list = [...list].sort((a, b) => new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime());
    }

    return list;
  }

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  applyFilters(): void {
    this.loadAuthors();
    this.toastService.success('Filtered author list successfully.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterCountry.set('');
    this.filterStatus.set('');
    this.filterTimeframe.set('all');
    this.filterSortBy.set('newest');
    this.loadAuthors();
    this.toastService.info('Author search filters reset.', 'Filters Reset');
  }

  approveAuthor(author: AuthorApplicationItem): void {
    this.adminApi.approveAuthor(author.user_id).subscribe({
      next: () => {
        this.toastService.success(`Approved ${author.full_name} as an official Author!`, 'Request Approved');
        this.loadAuthors();
      },
      error: () => {
        this.toastService.warning('Failed to approve author. Please try again.', 'Error');
      }
    });
  }

  rejectAuthor(author: AuthorApplicationItem): void {
    this.adminApi.rejectAuthor(author.user_id).subscribe({
      next: () => {
        this.toastService.warning(`Rejected application for ${author.full_name}.`, 'Request Rejected');
        this.loadAuthors();
      },
      error: () => {
        this.toastService.warning('Failed to reject author. Please try again.', 'Error');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-inactive';
    }
=======
export class AuthorsComponent {
  private readonly toastService = inject(ToastService);

  readonly authors = [
    {
      id: 1,
      fullName: 'Eleanor Vance',
      penName: 'E. V. Sterling',
      email: 'eleanor.v@lumina.com',
      country: 'United Kingdom',
      appliedDate: 'Oct 24, 2023',
      avatar: 'assets/images/auth/sign_in_1.png'
    },
    {
      id: 2,
      fullName: 'Julian Thorne',
      penName: 'J. Thistle',
      email: 'j.thorne@writes.org',
      country: 'Canada',
      appliedDate: 'Oct 23, 2023',
      avatar: 'assets/images/auth/sign_in_1.png'
    }
  ];

  approveAuthor(author: any): void {
    this.toastService.success(`Approved ${author.fullName} as an official Author!`, 'Request Approved');
  }

  rejectAuthor(author: any): void {
    this.toastService.warning(`Rejected application for ${author.fullName}.`, 'Request Rejected');
>>>>>>> origin/develop
  }

  createCommunity(): void {
    this.toastService.info('Opening Create Community dialogue...', 'Community');
  }
}

