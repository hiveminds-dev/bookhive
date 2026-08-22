import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule],
  templateUrl: './authors.html',
  styleUrl: './authors.scss',
})
export class AuthorsComponent {
  private readonly toastService = inject(ToastService);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterCountry = signal('');
  filterStatus = signal('');
  filterSortBy = signal('newest');

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  applyFilters(): void {
    this.toastService.success('Filtered author list successfully.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterCountry.set('');
    this.filterStatus.set('');
    this.filterSortBy.set('newest');
    this.toastService.info('Author search filters reset.', 'Filters Reset');
  }

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
  }

  createCommunity(): void {
    this.toastService.info('Opening Create Community dialogue...', 'Community');
  }
}
