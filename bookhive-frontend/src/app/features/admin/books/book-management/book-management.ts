import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminApiService, AdminBookItem } from '../../../../core/services/admin-api.service';

export interface AdminBookTableItem {
  id: number;
  title: string;
  isbn: string;
  author: string;
  category: string;
  language: string;
  pageCount: number | null;
  estimatedReadingTime: string;
  date: string;
  views: string;
  downloads: string;
  dlTrend: string;
  isActive: boolean;
  status: string;
  statusClass: string;
  cover: string | null;
}

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
  filterTimeframe = signal('all');
  filterSortBy = signal('newest');

  currentPage = signal<number>(1);
  pageSize = signal<number>(5);
  totalBooksSignal = signal<number>(0);
  totalPagesSignal = signal<number>(1);

  readonly booksSignal = signal<AdminBookTableItem[]>([]);
  readonly loadingSignal = signal<boolean>(false);

  selectedBookForView = signal<AdminBookTableItem | null>(null);

  ngOnInit(): void {
    this.loadBooks();
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    this.loadBooks();
  }

  loadBooks(): void {
    this.loadingSignal.set(true);
    const params = {
      search_query: this.searchQuery() || undefined,
      category_filter: this.filterCategory() || undefined,
      status_filter: this.filterStatus() || undefined,
      language_filter: this.filterLanguage() || undefined,
      timeframe_filter: this.filterTimeframe() || undefined,
      sort_by: this.filterSortBy() || undefined,
      page: this.currentPage(),
      page_size: this.pageSize(),
    };

    this.adminApi.getBooks(params).subscribe({
      next: (res) => {
        this.loadingSignal.set(false);
        if (res && res.items) {
          const mapped: AdminBookTableItem[] = res.items.map((b: AdminBookItem) => {
            const rawStatus = (b.status || '').toUpperCase();
            const isPub = rawStatus === 'PUBLISHED';
            const isDeact = rawStatus === 'DEACTIVATED';
            const isRev = rawStatus === 'PENDING_REVIEW';
            const isRej = rawStatus === 'REJECTED';

            let displayStatus = 'Draft';
            let statusClass = 'status-draft';
            if (isPub) {
              displayStatus = 'Published';
              statusClass = 'status-published';
            } else if (isDeact) {
              displayStatus = 'Deactivated';
              statusClass = 'status-deactivated';
            } else if (isRev) {
              displayStatus = 'Under Review';
              statusClass = 'status-review';
            } else if (isRej) {
              displayStatus = 'Rejected';
              statusClass = 'status-rejected';
            }

            const coverUrl = b.cover_image_path
              ? (b.cover_image_path.startsWith('http')
                  ? b.cover_image_path
                  : '/' + b.cover_image_path.replace(/^\/+/, ''))
              : null;

            return {
              id: b.id,
              title: b.title,
              isbn: b.isbn || 'Not available',
              author: b.author_name,
              category: b.category_name,
              language: b.language || 'English',
              pageCount: b.page_count && b.page_count > 0 ? b.page_count : null,
              estimatedReadingTime: b.estimated_reading_time || (b.page_count && b.page_count > 0 ? `${b.page_count * 2} mins` : 'Not available'),
              date: b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A',
              views: (b.view_count || 0).toLocaleString(),
              downloads: (b.download_count || 0).toLocaleString(),
              dlTrend: 'neutral',
              isActive: isPub,
              status: displayStatus,
              statusClass: statusClass,
              cover: coverUrl,
            };
          });
          this.booksSignal.set(mapped);
          this.totalBooksSignal.set(res.total);
          this.totalPagesSignal.set(res.total_pages);
        } else {
          this.booksSignal.set([]);
          this.totalBooksSignal.set(0);
          this.totalPagesSignal.set(1);
        }
      },
      error: () => {
        this.loadingSignal.set(false);
        this.booksSignal.set([]);
        this.totalBooksSignal.set(0);
        this.totalPagesSignal.set(1);
      },
    });
  }

  get filteredBooks(): AdminBookTableItem[] {
    return this.booksSignal();
  }

  get totalPages(): number {
    return this.totalPagesSignal();
  }

  get paginatedBooks(): AdminBookTableItem[] {
    return this.booksSignal();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
      this.loadBooks();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadBooks();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadBooks();
    }
  }

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update((v) => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadBooks();
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadBooks();
    this.toastService.success('Backend search & filters applied.', 'Search Complete');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterCategory.set('');
    this.filterStatus.set('');
    this.filterLanguage.set('');
    this.filterTimeframe.set('all');
    this.filterSortBy.set('newest');
    this.currentPage.set(1);
    this.loadBooks();
    this.toastService.info('All search filters reset.', 'Filters Reset');
  }

  openViewModal(book: AdminBookTableItem): void {
    this.selectedBookForView.set(book);
  }

  closeViewModal(): void {
    this.selectedBookForView.set(null);
  }

  toggleBookActive(book: AdminBookTableItem): void {
    const nextStatus = book.isActive ? 'DEACTIVATED' : 'PUBLISHED';
    const newActiveState = !book.isActive;

    this.adminApi.updateBookStatus(book.id, nextStatus).subscribe({
      next: () => {
        this.booksSignal.update((list) =>
          list.map((b) => {
            if (b.id === book.id) {
              return {
                ...b,
                isActive: newActiveState,
                status: newActiveState ? 'Published' : 'Deactivated',
                statusClass: newActiveState ? 'status-published' : 'status-deactivated',
              };
            }
            return b;
          })
        );
        if (newActiveState) {
          this.toastService.success(`"${book.title}" status saved as Published in DB!`, 'Live Updated');
        } else {
          this.toastService.warning(`"${book.title}" status saved as Deactivated in DB.`, 'Live Updated');
        }
      },
      error: (err) => {
        const msg = err.error?.detail || `Failed to update status for "${book.title}".`;
        this.toastService.error(msg, 'Status Update Failed');
      },
    });
  }
}
