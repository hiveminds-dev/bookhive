import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminApiService, AdminBookItem } from '../../../../core/services/admin-api.service';

export interface BookDetailModel {
  id?: number;
  title: string;
  author: string;
  authorTitle: string;
  authorBio: string;
  category: string;
  rating: string;
  reviewsCount: string;
  readTime: string;
  pages: string;
  cover: string | null;
  abstract: string;
  reviewSnippet: string;
  isbn?: string;
  language?: string;
  status?: string;
  pdfPath?: string;
  authorAvatar?: string | null;
  rejectionReason?: string;
  rejectionLogs?: { id: number; reason: string; created_at: string }[];
}

export interface ChapterItem {
  page: number;
  title: string;
  active: boolean;
}

export interface ReaderReviewItem {
  id: number;
  userName: string;
  avatarLetter: string;
  rating: number;
  date: string;
  comment: string;
}

@Component({
  selector: 'app-book-review',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule, DatePipe],
  templateUrl: './book-review.html',
  styleUrl: './book-review.scss',
})
export class BookReviewComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  readonly currentModeSignal = signal<'overview' | 'reader'>('overview');
  readonly showRejectConfirm = signal<boolean>(false);
  readonly rejectionReasonSignal = signal<string>('');
  readonly pdfViewerUrlSignal = signal<SafeResourceUrl | null>(null);

  readonly currentPageSignal = signal<number>(1);
  readonly totalPagesSignal = signal<number>(1);
  readonly zoomLevelSignal = signal<number>(100);
  readonly chaptersSignal = signal<ChapterItem[]>([]);

  readonly readerReviewsSignal = signal<ReaderReviewItem[]>([]);
  readonly loading = signal<boolean>(true);
  readonly isProcessing = signal<boolean>(false);

  rawPdfUrl = '';

  readonly bookSignal = signal<BookDetailModel | null>(null);

  get book(): BookDetailModel | null {
    return this.bookSignal();
  }

  get progressPercentage(): number {
    const total = this.totalPagesSignal();
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.round((this.currentPageSignal() / total) * 100));
  }

  get currentStatusInfo(): { label: string; class: string; nextStep: string } {
    const status = (this.book?.status || 'PENDING_REVIEW').toUpperCase();
    if (status === 'PUBLISHED') {
      return { label: 'Published & Active', class: 'status-published', nextStep: 'Live on Public Catalog' };
    } else if (status === 'REJECTED') {
      return { label: 'Rejected', class: 'status-rejected', nextStep: 'Returned to Author with Reason' };
    } else if (status === 'DEACTIVATED') {
      return { label: 'Deactivated', class: 'status-deactivated', nextStep: 'Hidden from Catalogue' };
    } else if (status === 'DRAFT') {
      return { label: 'Draft', class: 'status-draft', nextStep: 'Awaiting Author Submission' };
    }
    return { label: 'Under Editorial Review', class: 'status-pending', nextStep: 'Approve & Publish' };
  }

  ngOnInit(): void {
    const bookId = Number(this.route.snapshot.params['id']);
    if (bookId) {
      this.loadBookDetails(bookId);
    } else {
      this.loading.set(false);
    }
  }

  loadBookDetails(id: number): void {
    this.loading.set(true);
    this.adminApi.getBookById(id).subscribe({
      next: (found: AdminBookItem) => {
        this.loading.set(false);
        this.isProcessing.set(false);
        const pageCount = found.page_count && found.page_count > 0 ? found.page_count : null;
        const readTimeStr = found.estimated_reading_time || (pageCount ? `${pageCount * 2} mins` : 'Not available');

        const pdfUrl = found.cover_image_path && (found as any).pdf_path
          ? ((found as any).pdf_path.startsWith('http') ? (found as any).pdf_path : '/' + (found as any).pdf_path.replace(/^\/+/, ''))
          : ((found as any).pdf_path ? ((found as any).pdf_path.startsWith('http') ? (found as any).pdf_path : '/' + (found as any).pdf_path.replace(/^\/+/, '')) : '');

        this.rawPdfUrl = pdfUrl;
        this.totalPagesSignal.set(pageCount || 1);
        this.currentPageSignal.set(1);
        this.chaptersSignal.set([]);
        this.updatePdfViewerUrl();

        const apiReviews = found.reviews || [];
        this.readerReviewsSignal.set(
          apiReviews.map((r) => ({
            id: r.id,
            userName: r.user_name || 'Anonymous Reader',
            avatarLetter: r.avatar_letter || (r.user_name ? r.user_name[0].toUpperCase() : 'A'),
            rating: r.rating || 5,
            date: r.created_at,
            comment: r.comment || '',
          }))
        );

        const avgRating = found.average_rating ? `${found.average_rating.toFixed(1)}/5` : '0.0/5';
        const revCount = `${found.review_count || apiReviews.length} reviews`;

        const coverUrl = found.cover_image_path
          ? (found.cover_image_path.startsWith('http') ? found.cover_image_path : '/' + found.cover_image_path.replace(/^\/+/, ''))
          : null;

        const authorAvatarUrl = found.author_profile_image_path
          ? (found.author_profile_image_path.startsWith('http') ? found.author_profile_image_path : '/' + found.author_profile_image_path.replace(/^\/+/, ''))
          : null;

        this.bookSignal.set({
          id: found.id,
          title: found.title,
          author: found.author_name,
          authorTitle: 'Official BookHive Author',
          authorBio: `${found.author_name} is a registered author on BookHive.`,
          category: found.category_name ? found.category_name.toUpperCase() : 'GENERAL',
          rating: avgRating,
          reviewsCount: revCount,
          readTime: readTimeStr,
          pages: pageCount ? `${pageCount} pages` : 'Not available',
          cover: coverUrl,
          authorAvatar: authorAvatarUrl,
          abstract: `"${found.title}" is a manuscript submission in ${found.category_name} by ${found.author_name}.`,
          reviewSnippet: apiReviews.length > 0 ? (apiReviews[0].comment || 'Reader review recorded.') : 'No public reader reviews submitted yet.',
          isbn: found.isbn || 'Not available',
          language: found.language || 'English',
          status: found.status,
          pdfPath: pdfUrl,
          rejectionReason: found.rejection_reason || undefined,
          rejectionLogs: found.rejection_logs || [],
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.isProcessing.set(false);
        this.toastService.error(err.error?.detail || 'Failed to load book details.', 'Error');
      },
    });
  }

  private updatePdfViewerUrl(): void {
    if (this.rawPdfUrl) {
      const page = this.currentPageSignal();
      const fullUrl = `${this.rawPdfUrl}#page=${page}`;
      this.pdfViewerUrlSignal.set(this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl));
    } else {
      this.pdfViewerUrlSignal.set(null);
    }
  }

  goToPage(targetPage: number): void {
    const total = this.totalPagesSignal();
    let page = Number(targetPage) || 1;
    if (page < 1) page = 1;
    if (page > total) page = total;

    this.currentPageSignal.set(page);

    if (this.chaptersSignal().length > 0) {
      this.chaptersSignal.update((chList) =>
        chList.map((ch) => ({
          ...ch,
          active:
            ch.page === page ||
            (ch.page <= page &&
              (ch === chList[chList.length - 1] || chList[chList.indexOf(ch) + 1].page > page)),
        }))
      );
    }

    this.updatePdfViewerUrl();
  }

  nextPage(): void {
    if (this.currentPageSignal() < this.totalPagesSignal()) {
      this.goToPage(this.currentPageSignal() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPageSignal() > 1) {
      this.goToPage(this.currentPageSignal() - 1);
    }
  }

  zoomIn(): void {
    if (this.zoomLevelSignal() < 250) {
      this.zoomLevelSignal.update((z) => z + 25);
    }
  }

  zoomOut(): void {
    if (this.zoomLevelSignal() > 50) {
      this.zoomLevelSignal.update((z) => z - 25);
    }
  }

  downloadPdf(): void {
    if (this.rawPdfUrl) {
      const link = document.createElement('a');
      link.href = this.rawPdfUrl;
      link.target = '_blank';
      link.download = `${(this.book?.title || 'manuscript').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.toastService.success(`Downloading manuscript for "${this.book?.title}"...`, 'File Download');
    } else {
      this.toastService.info('No manuscript PDF file attached to this book.', 'Notice');
    }
  }

  switchMode(mode: 'overview' | 'reader'): void {
    this.currentModeSignal.set(mode);
  }

  approvePublication(): void {
    const currentBook = this.book;
    if (!currentBook?.id) return;
    const bookId = currentBook.id;

    this.isProcessing.set(true);
    this.adminApi.approveBook(bookId).subscribe({
      next: () => {
        this.toastService.success(`"${currentBook.title}" was approved and published!`, 'Book Published');
        this.loadBookDetails(bookId);
      },
      error: (err) => {
        this.isProcessing.set(false);
        const errorMsg = err.error?.detail || 'Failed to approve book.';
        this.toastService.error(errorMsg, 'Approval Failed');
      },
    });
  }

  readonly showChangesModal = signal<boolean>(false);
  readonly changesFeedbackSignal = signal<string>('');

  promptRequestChanges(): void {
    this.changesFeedbackSignal.set('');
    this.showChangesModal.set(true);
  }

  cancelRequestChanges(): void {
    if (this.isProcessing()) return;
    this.showChangesModal.set(false);
  }

  confirmRequestChanges(): void {
    const feedback = this.changesFeedbackSignal().trim();
    if (!feedback) {
      this.toastService.error('Feedback is required when requesting changes.', 'Validation Error');
      return;
    }
    if (feedback.length > 500) {
      this.toastService.error('Feedback cannot exceed 500 characters.', 'Validation Error');
      return;
    }

    const currentBook = this.book;
    if (!currentBook?.id) return;
    const bookId = currentBook.id;

    this.isProcessing.set(true);
    this.adminApi.requestBookChanges(bookId, feedback).subscribe({
      next: (res) => {
        this.showChangesModal.set(false);
        this.toastService.success(
          res.message || `Revision request sent to author ${currentBook.author}.`,
          'Changes Requested'
        );
        this.loadBookDetails(bookId);
      },
      error: (err) => {
        this.isProcessing.set(false);
        const errorMsg = err.error?.detail || 'Failed to send revision request.';
        this.toastService.error(errorMsg, 'Request Failed');
      },
    });
  }

  promptReject(): void {
    this.rejectionReasonSignal.set('');
    this.showRejectConfirm.set(true);
  }

  cancelReject(): void {
    if (this.isProcessing()) return;
    this.showRejectConfirm.set(false);
  }

  confirmReject(): void {
    const reason = this.rejectionReasonSignal().trim();
    if (!reason) {
      this.toastService.error('A rejection reason is mandatory when rejecting a book submission.', 'Validation Error');
      return;
    }
    if (reason.length > 500) {
      this.toastService.error('Rejection reason cannot exceed 500 characters.', 'Validation Error');
      return;
    }

    const currentBook = this.book;
    if (!currentBook?.id) return;
    const bookId = currentBook.id;

    this.isProcessing.set(true);
    this.adminApi.rejectBook(bookId, reason).subscribe({
      next: () => {
        this.showRejectConfirm.set(false);
        this.toastService.warning(`Submission for "${currentBook.title}" was rejected.`, 'Submission Rejected');
        this.loadBookDetails(bookId);
      },
      error: (err) => {
        this.isProcessing.set(false);
        const errorMsg = err.error?.detail || 'Failed to reject book.';
        this.toastService.error(errorMsg, 'Rejection Failed');
      },
    });
  }
}
