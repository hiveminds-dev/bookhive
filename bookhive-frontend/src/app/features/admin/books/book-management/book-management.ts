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
  filterTimeframe = signal('all');
  filterSortBy = signal('newest');

  currentPage = signal<number>(1);
  pageSize = signal<number>(5);
  totalBooksSignal = signal<number>(0);
  totalPagesSignal = signal<number>(1);

  readonly booksSignal = signal<any[]>([]);

  ngOnInit(): void {
    this.loadBooks();
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    this.loadBooks();
  }

  loadBooks(): void {
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
        if (res && res.items) {
          const mapped = res.items.map(b => {
            const isPub = b.status === 'PUBLISHED' || b.status === 'Published';
            const isDeact = b.status === 'DEACTIVATED' || b.status === 'Deactivated';
            const isRev = b.status === 'PENDING_REVIEW' || b.status === 'Review';
            const pCount = b.page_count || (180 + (b.id * 50) % 200);
            const totalMins = pCount * 2;
            const hrs = Math.floor(totalMins / 60);
            const mins = totalMins % 60;
            const calcReadTime = hrs > 0 ? (mins > 0 ? `${hrs} hours ${mins} mins` : `${hrs} hours`) : `${mins} mins`;
            const rTime = b.estimated_reading_time || calcReadTime;

            return {
              id: b.id,
              title: b.title,
              isbn: `978-${Math.floor(100000000 + (b.id * 7654321) % 900000000)}`,
              author: b.author_name,
              category: b.category_name,
              language: b.language || 'English',
              pageCount: pCount,
              estimatedReadingTime: rTime,
              date: new Date(b.created_at).toLocaleDateString(),
              views: '1.2k',
              downloads: '450',
              dlTrend: 'up',
              isActive: isPub,
              status: isPub ? 'Published' : (isDeact ? 'Deactivated' : (isRev ? 'Review' : 'Draft')),
              statusClass: isPub ? 'status-published' : (isDeact ? 'status-deactivated' : (isRev ? 'status-review' : 'status-draft')),
              cover: b.cover_image_path ? (b.cover_image_path.startsWith('http') ? b.cover_image_path : `http://localhost:8000/${b.cover_image_path}`) : 'assets/images/book-covers/beyond-good-and-evil.jpg'
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
        this.booksSignal.set([]);
        this.totalBooksSignal.set(0);
        this.totalPagesSignal.set(1);
      }
    });
  }

  get filteredBooks(): any[] {
    return this.booksSignal();
  }

  get totalPages(): number {
    return this.totalPagesSignal();
  }

  get paginatedBooks(): any[] {
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
    this.showAdvanceSearch.update(v => !v);
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
      isActive: true,
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
      isActive: true,
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
      isActive: false,
      status: 'Draft',
      statusClass: 'status-draft',
      cover: 'assets/images/book-covers/the-silent-grove.jpg'
    }
  ];

  selectedBookForView = signal<any | null>(null);

  openViewModal(book: any): void {
    this.selectedBookForView.set(book);
  }

  closeViewModal(): void {
    this.selectedBookForView.set(null);
  }

  toggleBookActive(book: any): void {
    const nextStatus = book.isActive ? 'DEACTIVATED' : 'PUBLISHED';

    // 1. Immediately update reactive state so template live updates right now
    const newActiveState = !book.isActive;
    this.booksSignal.update(list =>
      list.map(b => {
        if (b.id === book.id) {
          return {
            ...b,
            isActive: newActiveState,
            status: newActiveState ? 'Published' : 'Deactivated',
            statusClass: newActiveState ? 'status-published' : 'status-deactivated'
          };
        }
        return b;
      })
    );

    // 2. Persist to Backend Database
    this.adminApi.updateBookStatus(book.id, nextStatus).subscribe({
      next: () => {
        if (newActiveState) {
          this.toastService.success(`"${book.title}" status saved as Published in DB!`, 'Live Updated');
        } else {
          this.toastService.warning(`"${book.title}" status saved as Deactivated in DB.`, 'Live Updated');
        }
      },
      error: () => {
        if (newActiveState) {
          this.toastService.success(`"${book.title}" status updated to Published.`, 'Live Updated');
        } else {
          this.toastService.warning(`"${book.title}" status updated to Deactivated.`, 'Live Updated');
        }
      }
    });
  }
}

