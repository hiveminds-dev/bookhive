import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { Subscription } from 'rxjs';

import { BookDetails, BookService } from '../../../core/services/book.service';
import {
  PageNavigationComponent,
} from './components/page-navigation/page-navigation';
import {
  ReaderSettingsComponent,
} from './components/reader-settings/reader-settings';
import {
  ReaderChapter,
  ReaderSidebarComponent,
} from './components/reader-sidebar/reader-sidebar';
import {
  ReaderToolbarComponent,
} from './components/reader-toolbar/reader-toolbar';

export interface ReaderBook {
  id: number;
  title: string;
  author: string;
  category: string;
  language: string;
  cover: string;
  totalPages: number | null;
  rating: number;
  pdfUrl: string | null;
}

@Component({
  selector: 'app-book-reader',
  standalone: true,
  imports: [
    CommonModule,
    ReaderSidebarComponent,
    ReaderToolbarComponent,
    ReaderSettingsComponent,
    PageNavigationComponent,
  ],
  templateUrl: './book-reader.html',
  styleUrl: './book-reader.scss',
})
export class BookReaderComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly changeDetector = inject(ChangeDetectorRef);

  private timerId?: ReturnType<typeof setInterval>;
  private routeSubscription?: Subscription;

  readonly secondsRequiredToReadPage = 30;

  bookId: number | null = null;
  book: ReaderBook | null = null;

  currentPage = 1;
  lastReadPage = 1;
  zoomLevel = 100;
  secondsRemaining = this.secondsRequiredToReadPage;

  bookmarked = false;
  pageQualifiedAsRead = false;
  isLoading = false;
  notFound = false;
  hasServerError = false;
  errorMessage = '';

  rawPdfUrl = '';
  pdfViewerUrl: SafeResourceUrl | null = null;
  chapters: ReaderChapter[] = [];

  get effectiveTotalPages(): number {
    return this.book?.totalPages && this.book.totalPages > 0 ? this.book.totalPages : 1;
  }

  get progressStorageKey(): string {
    return `bookhive-reading-progress-${this.bookId}`;
  }

  get bookmarkStorageKey(): string {
    return `bookhive-bookmark-${this.bookId}`;
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const rawId = params.get('id');
      const parsedId = Number(rawId);

      if (!rawId || isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
        this.bookId = null;
        this.book = null;
        this.notFound = true;
        this.hasServerError = false;
        this.isLoading = false;
        this.errorMessage = 'The requested book ID is invalid.';
        this.stopPageReadingTimer();
        this.changeDetector.markForCheck();
        return;
      }

      this.bookId = parsedId;
      this.loadBook(parsedId);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.stopPageReadingTimer();
  }

  loadBook(id: number): void {
    this.isLoading = true;
    this.notFound = false;
    this.hasServerError = false;
    this.errorMessage = '';
    this.book = null;
    this.pdfViewerUrl = null;
    this.rawPdfUrl = '';
    this.stopPageReadingTimer();
    this.changeDetector.markForCheck();

    this.bookService.getBookDetails(id).subscribe({
      next: (data: BookDetails) => {
        const hasValidPages = typeof data.page_count === 'number' && data.page_count > 0;
        const totalPages = hasValidPages ? data.page_count! : null;

        this.book = {
          id: data.id,
          title: data.title,
          author: data.author?.display_name || 'Unknown Author',
          category: data.category?.name || 'General',
          language: data.language || 'English',
          cover: data.cover_url || 'images/reader/architecture-of-light.jpg',
          totalPages: totalPages,
          rating: data.average_rating ?? 0,
          pdfUrl: data.pdf_url,
        };

        this.isLoading = false;
        this.restoreReadingProgress();
        this.restoreBookmark();

        if (data.pdf_url) {
          this.rawPdfUrl = data.pdf_url;
          this.updatePdfViewerUrl();
          this.startPageReadingTimer();
        } else {
          this.rawPdfUrl = '';
          this.pdfViewerUrl = null;
          this.stopPageReadingTimer();
        }

        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.book = null;
        this.pdfViewerUrl = null;
        this.rawPdfUrl = '';
        this.stopPageReadingTimer();

        if (error.status === 404) {
          this.notFound = true;
          this.errorMessage =
            typeof error.error?.detail === 'string'
              ? error.error.detail
              : 'The requested book does not exist.';
        } else {
          this.hasServerError = true;
          this.errorMessage =
            error.status === 0
              ? 'Unable to connect to BookHive server. Please check your connection.'
              : 'Failed to load book content. Please try again.';
        }
        this.changeDetector.markForCheck();
      },
    });
  }

  retry(): void {
    if (this.bookId) {
      this.loadBook(this.bookId);
    }
  }

  nextPage(): void {
    if (!this.book || !this.book.pdfUrl) {
      return;
    }
    if (this.currentPage >= this.effectiveTotalPages) {
      return;
    }
    this.changePage(this.currentPage + 1);
  }

  previousPage(): void {
    if (!this.book || !this.book.pdfUrl || this.currentPage <= 1) {
      return;
    }
    this.changePage(this.currentPage - 1);
  }

  goToPage(page: number): void {
    if (!this.book || !this.book.pdfUrl) {
      return;
    }
    this.changePage(page);
  }

  selectChapter(chapter: ReaderChapter): void {
    if (!this.book || !this.book.pdfUrl) {
      return;
    }
    this.changePage(chapter.page);
  }

  changePage(page: number): void {
    if (
      !this.book ||
      !this.book.pdfUrl ||
      !Number.isInteger(page) ||
      page < 1 ||
      (this.book.totalPages && page > this.book.totalPages) ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.pageQualifiedAsRead = false;

    this.updatePdfViewerUrl();
    this.restartPageReadingTimer();
    this.scrollReaderToTop();
  }

  zoomIn(): void {
    if (!this.book || !this.book.pdfUrl) return;
    if (this.zoomLevel < 150) {
      this.zoomLevel += 10;
      this.updatePdfViewerUrl();
    }
  }

  zoomOut(): void {
    if (!this.book || !this.book.pdfUrl) return;
    if (this.zoomLevel > 50) {
      this.zoomLevel -= 10;
      this.updatePdfViewerUrl();
    }
  }

  onBookmarkChanged(bookmarked: boolean): void {
    if (!this.book || !this.bookId) return;
    this.bookmarked = bookmarked;
    localStorage.setItem(this.bookmarkStorageKey, JSON.stringify(bookmarked));
  }

  downloadBook(): void {
    if (!this.book || !this.bookId || !this.book.pdfUrl) return;
    const link = document.createElement('a');
    link.href = this.book.pdfUrl;
    link.download = `${this.book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  shareExcerpt(): void {
    if (!this.book || !this.book.pdfUrl) return;
    console.log('Share excerpt from page:', this.currentPage);
  }

  reportIssue(): void {
    if (!this.book) return;
    console.log('Report issue on page:', this.currentPage);
  }

  openFullscreen(): void {
    if (!this.book) return;
    const readerElement = document.querySelector('.reader-workspace') as HTMLElement | null;

    if (!readerElement) {
      return;
    }

    if (!document.fullscreenElement) {
      void readerElement.requestFullscreen();
      return;
    }

    void document.exitFullscreen();
  }

  backToLibrary(): void {
    this.router.navigate(['/explore']);
  }

  private updatePdfViewerUrl(): void {
    if (!this.rawPdfUrl) {
      this.pdfViewerUrl = null;
      return;
    }
    const fullUrl = `${this.rawPdfUrl}#page=${this.currentPage}&zoom=${this.zoomLevel}`;
    this.pdfViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  }

  private startPageReadingTimer(): void {
    this.stopPageReadingTimer();
    if (!this.book || !this.book.pdfUrl) return;

    this.secondsRemaining = this.secondsRequiredToReadPage;
    this.pageQualifiedAsRead = false;

    this.timerId = setInterval(() => {
      this.secondsRemaining -= 1;

      if (this.secondsRemaining <= 0) {
        this.markCurrentPageAsRead();
        this.stopPageReadingTimer();
      }
    }, 1000);
  }

  private restartPageReadingTimer(): void {
    this.startPageReadingTimer();
  }

  private stopPageReadingTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  private markCurrentPageAsRead(): void {
    this.pageQualifiedAsRead = true;
    this.secondsRemaining = 0;
    this.lastReadPage = this.currentPage;
    this.saveReadingProgress();
  }

  private saveReadingProgress(): void {
    if (!this.bookId) return;
    localStorage.setItem(this.progressStorageKey, String(this.lastReadPage));
  }

  private restoreReadingProgress(): void {
    if (!this.book || !this.bookId) return;
    const savedPage = Number(localStorage.getItem(this.progressStorageKey));

    const maxPage = this.effectiveTotalPages;
    if (
      Number.isInteger(savedPage) &&
      savedPage >= 1 &&
      savedPage <= maxPage
    ) {
      this.lastReadPage = savedPage;
      this.currentPage = savedPage;
      return;
    }

    this.lastReadPage = 1;
    this.currentPage = 1;
  }

  private restoreBookmark(): void {
    if (!this.bookId) return;
    const savedBookmark = localStorage.getItem(this.bookmarkStorageKey);
    this.bookmarked = savedBookmark === 'true';
  }

  private scrollReaderToTop(): void {
    const readerCenter = document.querySelector<HTMLElement>('.reader-center');
    if (typeof readerCenter?.scrollIntoView !== 'function') {
      return;
    }
    readerCenter.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
