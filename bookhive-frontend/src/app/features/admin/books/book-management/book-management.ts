import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule],
  templateUrl: './book-management.html',
  styleUrl: './book-management.scss',
})
export class BookManagement {
  private readonly toastService = inject(ToastService);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterCategory = signal('');
  filterStatus = signal('');
  filterLanguage = signal('');
  filterSortBy = signal('newest');

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  applyFilters(): void {
    this.toastService.success('Search filters applied to repository books.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterCategory.set('');
    this.filterStatus.set('');
    this.filterLanguage.set('');
    this.filterSortBy.set('newest');
    this.toastService.info('All search filters reset.', 'Filters Reset');
  }

  readonly books = [
    {
      id: 1,
      title: 'Beyond Good and Evil',
      isbn: '978-0140449235',
      author: 'F. Nietzsche',
      category: 'Philosophy',
      language: 'English',
      date: 'Oct 12, 2023',
      views: '2.4k',
      downloads: '842',
      dlTrend: 'down',
      status: 'Published',
      statusClass: 'status-published',
      cover: 'assets/images/book-covers/beyond-good-and-evil.jpg'
    },
    {
      id: 2,
      title: 'Quantum Mechanics',
      isbn: '978-0521897839',
      author: 'Dr. Sarah Chen',
      category: 'Science',
      language: 'English',
      date: 'Nov 02, 2023',
      views: '1.1k',
      downloads: '156',
      dlTrend: 'up',
      status: 'Under Review',
      statusClass: 'status-review',
      cover: 'assets/images/book-covers/quantum-mechanics.jpg'
    },
    {
      id: 3,
      title: 'The Silent Grove',
      isbn: '978-1501160837',
      author: 'Elena Rossi',
      category: 'Fiction',
      language: 'Spanish',
      date: 'Jan 15, 2024',
      views: '450',
      downloads: '24',
      dlTrend: 'flat',
      status: 'Draft',
      statusClass: 'status-draft',
      cover: 'assets/images/book-covers/the-silent-grove.jpg'
    }
  ];

  previewBook(book: any): void {
    this.toastService.info(`Opening preview for "${book.title}"...`, 'Book Preview');
  }

  editBook(book: any): void {
    this.toastService.info(`Editing details for "${book.title}"...`, 'Edit Book');
  }

  deleteBook(book: any): void {
    this.toastService.warning(`Removed "${book.title}" from repository.`, 'Book Deleted');
  }
}
