import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

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
  ManagedBook
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
export class BookManagementComponent {

  private readonly router = inject(Router);

  selectedStatus: BookFilterStatus = 'All';
  searchTerm = '';

  currentPage = 1;
  readonly pageSize = 6;

  books: ManagedBook[] = [
    {
      id: 1,
      title: 'Meditations on Solitude',
      category: 'Philosophy',
      language: 'English',
      status: 'Published',
      cover:
        'images/author-books/meditations.jpg',
      bannerImage:
        'images/author-books/meditations-banner.jpg',
      views: 1200,
      downloads: 800,
      uploadedDate: 'Oct 12, 2023'
    },
    {
      id: 2,
      title: 'The Ethical Arc',
      category: 'Ethics',
      language: 'English',
      status: 'Draft',
      cover:
        'images/author-books/ethical-arc.jpg',
      bannerImage:
        'images/author-books/ethical-arc-banner.jpg',
      views: 0,
      downloads: 0,
      uploadedDate: 'Nov 04, 2023'
    }
  ];

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
    this.router.navigate([
      '/explore',
      book.id,
      'preview'
    ]);
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

    this.books = this.books.filter(
      currentBook =>
        currentBook.id !== book.id
    );

    if (
      this.currentPage >
      this.totalPages
    ) {
      this.currentPage =
        this.totalPages;
    }
  }
}
