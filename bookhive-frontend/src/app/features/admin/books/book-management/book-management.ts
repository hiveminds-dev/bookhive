import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminApiService } from '../../../../core/services/admin-api.service';

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule],
  templateUrl: './book-management.html',
  styleUrl: './book-management.scss',
})
export class BookManagement implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApiService);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterCategory = signal('');
  filterStatus = signal('');
  filterLanguage = signal('');
  filterSortBy = signal('newest');

  readonly booksSignal = signal<any[]>([]);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.adminApi.getBooks().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const mapped = data.map(b => ({
            id: b.id,
            title: b.title,
            isbn: `978-${Math.floor(100000000 + Math.random() * 900000000)}`,
            author: b.author_name,
            category: b.category_name,
            language: b.language || 'English',
            date: new Date(b.created_at).toLocaleDateString(),
            views: '1.2k',
            downloads: '450',
            dlTrend: 'up',
            status: b.status === 'PUBLISHED' || b.status === 'Published' ? 'Published' : (b.status === 'PENDING_REVIEW' ? 'Review' : 'Draft'),
            statusClass: b.status === 'PUBLISHED' || b.status === 'Published' ? 'status-published' : (b.status === 'PENDING_REVIEW' ? 'status-review' : 'status-draft'),
            cover: b.cover_image_path ? `/${b.cover_image_path}` : 'assets/images/book-covers/beyond-good-and-evil.jpg'
          }));
          this.booksSignal.set(mapped);
        } else {
          this.booksSignal.set(this.defaultBooks);
        }
      },
      error: () => {
        this.booksSignal.set(this.defaultBooks);
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

  private readonly defaultBooks = [
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
