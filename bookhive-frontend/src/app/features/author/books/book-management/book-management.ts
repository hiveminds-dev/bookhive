import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  BookService,
  AuthorBookItem
} from '../../../../core/services/book.service';

import {
  ToastService
} from '../../../../core/services/toast.service';

import {
  PageHeaderComponent
} from './components/page-header/page-header';

import {
  BookFilterStatus,
  BookFiltersComponent
} from './components/book-filters/book-filters';

import {
  BookGridComponent
} from './components/book-grid/book-grid';

import {
  ManagedBook,
  ManagedBookStatus
} from './components/book-card/book-card';

import {
  PaginationComponent
} from './components/pagination/pagination';

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [
    PageHeaderComponent,
    BookFiltersComponent,
    BookGridComponent,
    PaginationComponent
  ],
  templateUrl: './book-management.html',
  styleUrl: './book-management.scss'
})
export class BookManagementComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly toastService = inject(ToastService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  selectedStatus: BookFilterStatus = 'All';
  searchTerm = '';

  currentPage = 1;
  readonly pageSize = 6;
  isLoading = false;

  books: ManagedBook[] = [];

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.bookService.getAuthorBooks().subscribe({
      next: (items) => {
        this.isLoading = false;
        this.books = items.map((item) => this.mapToManagedBook(item));
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.warning('Failed to load your books list.', 'Notice');
        this.changeDetector.markForCheck();
      }
    });
  }

  private mapToManagedBook(item: AuthorBookItem): ManagedBook {
    let status: ManagedBookStatus = 'Draft';
    const s = item.status.toUpperCase();
    if (s === 'PUBLISHED') {
      status = 'Published';
    } else if (s === 'PENDING_REVIEW' || s === 'PENDING') {
      status = 'Pending';
    } else if (s === 'REJECTED') {
      status = 'Rejected';
    } else {
      status = 'Draft';
    }

    const cover = item.cover_url || (item.cover_image_path ? `/${item.cover_image_path}` : 'images/author-books/default-cover.jpg');

    let uploadedDate = '';
    if (item.created_at) {
      uploadedDate = new Date(item.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    return {
      id: item.id,
      title: item.title,
      category: item.category_name || 'General',
      language: item.language || 'English',
      status,
      cover,
      bannerImage: cover,
      views: 0,
      downloads: 0,
      uploadedDate,
      rejectionReason: item.rejection_reason
    };
  }

  get filteredBooks(): ManagedBook[] {
    let result = [...this.books];

    if (this.selectedStatus !== 'All') {
      result = result.filter(
        book =>
          book.status === this.selectedStatus
      );
    }

    const search =
      this.searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter(book =>
        book.title
          .toLowerCase()
          .includes(search)
      );
    }

    return result;
  }

  get paginatedBooks(): ManagedBook[] {
    const startIndex =
      (this.currentPage - 1) *
      this.pageSize;

    return this.filteredBooks.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.filteredBooks.length /
        this.pageSize
      )
    );
  }

  onStatusChanged(
    status: BookFilterStatus
  ): void {
    this.selectedStatus = status;
    this.currentPage = 1;
  }

  onSearchChanged(search: string): void {
    this.searchTerm = search;
    this.currentPage = 1;
  }

  onPageChanged(page: number): void {
    this.currentPage = page;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  goToUploadBook(): void {
    this.router.navigate([
      '/author/books/upload'
    ]);
  }

  viewBook(book: ManagedBook): void {
    if (book.status === 'Published') {
      this.router.navigate([
        '/explore',
        book.id,
        'preview'
      ]);
    } else {
      this.router.navigate([
        '/author/books/edit',
        book.id
      ]);
    }
  }

  editBook(book: ManagedBook): void {
    this.router.navigate([
      '/author/books/edit',
      book.id
    ]);
  }

  deleteBook(book: ManagedBook): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.bookService.deleteAuthorBook(book.id).subscribe({
      next: () => {
        this.books = this.books.filter(
          currentBook => currentBook.id !== book.id
        );
        this.toastService.success(`"${book.title}" deleted successfully.`, 'Book Deleted');

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      },
      error: (err) => {
        const msg = err.error?.detail || 'Failed to delete book.';
        this.toastService.warning(msg, 'Error');
      }
    });
  }
}
