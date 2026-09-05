import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Auth } from '../../../core/services/auth';
import {
  BookDetails,
  BookService,
  CatalogueBook,
  PublicReview,
} from '../../../core/services/book.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthorInfoComponent } from './components/author-info/author-info';
import { BookActionsComponent } from './components/book-actions/book-actions';
import { BookCoverComponent } from './components/book-cover/book-cover';
import { BookDescriptionComponent } from './components/book-description/book-description';
import { BookHeaderComponent } from './components/book-header/book-header';
import { BookInfoComponent } from './components/book-info/book-info';
import {
  RelatedBook,
  RelatedBooksComponent,
} from './components/related-books/related-books';
import {
  ReaderReview,
  ReviewsComponent,
} from './components/reviews/reviews';

export interface PreviewBook {
  id: number;
  title: string;
  author: string;
  categoryId: number | null;
  category: string;
  language: string;
  rating: number;
  reviewsCount: number;
  pages: number | null;
  readingTime: string | null;
  cover: string;
  badge: string;
  canDownload: boolean;
  description: string[];
  authorInfo: {
    name: string;
    role: string;
    image: string;
    biography: string;
  };
}

@Component({
  selector: 'app-book-preview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BookCoverComponent,
    BookHeaderComponent,
    BookInfoComponent,
    BookActionsComponent,
    BookDescriptionComponent,
    AuthorInfoComponent,
    ReviewsComponent,
    RelatedBooksComponent,
  ],
  templateUrl: './book-preview.html',
  styleUrl: './book-preview.scss',
})
export class BookPreviewComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly auth = inject(Auth);
  private readonly toast = inject(ToastService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  private routeSubscription?: Subscription;

  bookId: number | null = null;
  book: PreviewBook | null = null;
  bookDetailsRaw: BookDetails | null = null;
  isLoading = false;
  notFound = false;
  hasServerError = false;
  errorMessage = '';

  readerReviews: ReaderReview[] = [];

  // Review modal state
  showReviewModal = false;
  isEditingReview = false;
  editingReviewId: number | null = null;
  reviewRating = 5;
  reviewComment = '';
  isSubmittingReview = false;
  reviewFormError = '';

  // Delete modal state
  showDeleteConfirmModal = false;
  deletingReviewId: number | null = null;
  isDeletingReview = false;

  relatedBooks: RelatedBook[] = [];
  isRelatedLoading = false;

  get currentUserId(): number | undefined {
    return this.auth.currentUser()?.id;
  }

  get hasUserReviewed(): boolean {
    const currentId = this.currentUserId;
    if (!currentId) return false;
    return this.readerReviews.some((r) => r.userId === currentId || r.isOwnReview);
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const rawId = params.get('id');
      const parsedId = Number(rawId);

      if (!rawId || isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
        this.bookId = null;
        this.book = null;
        this.bookDetailsRaw = null;
        this.notFound = true;
        this.hasServerError = false;
        this.isLoading = false;
        this.errorMessage = 'The requested book ID is invalid.';
        this.changeDetector.markForCheck();
        return;
      }

      this.bookId = parsedId;
      this.loadBook(parsedId);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  loadBook(bookId: number): void {
    this.isLoading = true;
    this.notFound = false;
    this.hasServerError = false;
    this.errorMessage = '';
    this.book = null;
    this.bookDetailsRaw = null;
    this.changeDetector.markForCheck();

    this.bookService.getBookDetails(bookId).subscribe({
      next: (data: BookDetails) => {
        this.bookDetailsRaw = data;
        this.book = this.mapToPreviewBook(data);
        this.readerReviews = this.mapReviews(data);
        this.isLoading = false;
        this.loadRelatedBooks(data);
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.book = null;
        this.bookDetailsRaw = null;
        this.relatedBooks = [];
        this.isRelatedLoading = false;

        if (error.status === 404) {
          this.notFound = true;
          this.errorMessage =
            typeof error.error?.detail === 'string'
              ? error.error.detail
              : 'The requested book does not exist in our library.';
        } else {
          this.hasServerError = true;
          this.errorMessage =
            error.status === 0
              ? 'Unable to connect to BookHive server. Please check your connection.'
              : 'Failed to retrieve book details. Please try again.';
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

  onReadBook(): void {
    if (!this.book) {
      return;
    }
    this.router.navigate(['/book-reader', this.book.id]);
  }

  onDownloadBook(): void {
    if (!this.book || !this.book.canDownload || !this.bookDetailsRaw?.pdf_url) {
      this.toast.warning('PDF is not available for download on this book.', 'Download Unavailable');
      return;
    }

    const link = document.createElement('a');
    link.href = this.bookDetailsRaw.pdf_url;
    link.download = `${this.book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onWriteReview(): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    const currentUser = this.auth.currentUser();
    if (currentUser?.role !== 'reader') {
      this.toast.warning('Only reader accounts can submit book reviews.', 'Reader Role Required');
      return;
    }

    const ownReview = this.readerReviews.find(
      (r) => r.userId === currentUser.id || r.isOwnReview
    );
    if (ownReview) {
      this.openEditReview(ownReview);
      return;
    }

    this.isEditingReview = false;
    this.editingReviewId = null;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.reviewFormError = '';
    this.showReviewModal = true;
    this.changeDetector.markForCheck();
  }

  openEditReview(review: ReaderReview): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.isEditingReview = true;
    this.editingReviewId = review.id;
    this.reviewRating = review.rating;
    this.reviewComment = review.comment === 'No written comment.' ? '' : review.comment;
    this.reviewFormError = '';
    this.showReviewModal = true;
    this.changeDetector.markForCheck();
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.isSubmittingReview = false;
    this.reviewFormError = '';
    this.changeDetector.markForCheck();
  }

  setReviewRating(rating: number): void {
    this.reviewRating = rating;
  }

  submitReviewModal(): void {
    if (!this.reviewRating || this.reviewRating < 1 || this.reviewRating > 5) {
      this.reviewFormError = 'Please select a rating between 1 and 5 stars.';
      return;
    }

    this.isSubmittingReview = true;
    this.reviewFormError = '';
    const commentTrimmed = this.reviewComment.trim() || null;

    if (this.isEditingReview && this.editingReviewId) {
      this.bookService
        .updateReview(this.editingReviewId, {
          rating: this.reviewRating,
          comment: commentTrimmed,
        })
        .subscribe({
          next: () => {
            this.isSubmittingReview = false;
            this.closeReviewModal();
            this.toast.success('Your review has been updated successfully.', 'Review Updated');
            if (this.bookId) this.loadBook(this.bookId);
          },
          error: (error: HttpErrorResponse) => {
            this.isSubmittingReview = false;
            this.reviewFormError =
              typeof error.error?.detail === 'string'
                ? error.error.detail
                : 'Failed to update your review. Please try again.';
            this.changeDetector.markForCheck();
          },
        });
    } else if (this.bookId) {
      this.bookService
        .createReview(this.bookId, {
          rating: this.reviewRating,
          comment: commentTrimmed,
        })
        .subscribe({
          next: () => {
            this.isSubmittingReview = false;
            this.closeReviewModal();
            this.toast.success('Thank you! Your review has been published.', 'Review Published');
            if (this.bookId) this.loadBook(this.bookId);
          },
          error: (error: HttpErrorResponse) => {
            this.isSubmittingReview = false;
            this.reviewFormError =
              typeof error.error?.detail === 'string'
                ? error.error.detail
                : 'Failed to submit review. Please try again.';
            this.changeDetector.markForCheck();
          },
        });
    }
  }

  openDeleteReview(reviewId: number): void {
    this.deletingReviewId = reviewId;
    this.showDeleteConfirmModal = true;
    this.changeDetector.markForCheck();
  }

  closeDeleteConfirmModal(): void {
    this.showDeleteConfirmModal = false;
    this.deletingReviewId = null;
    this.isDeletingReview = false;
    this.changeDetector.markForCheck();
  }

  confirmDeleteReview(): void {
    if (!this.deletingReviewId) return;

    this.isDeletingReview = true;
    this.bookService.deleteReview(this.deletingReviewId).subscribe({
      next: () => {
        this.isDeletingReview = false;
        this.closeDeleteConfirmModal();
        this.toast.success('Your review has been deleted.', 'Review Deleted');
        if (this.bookId) this.loadBook(this.bookId);
      },
      error: (error: HttpErrorResponse) => {
        this.isDeletingReview = false;
        this.toast.error(
          typeof error.error?.detail === 'string'
            ? error.error.detail
            : 'Failed to delete review. Please try again.',
          'Error'
        );
        this.closeDeleteConfirmModal();
      },
    });
  }

  onRelatedBookSelected(book: RelatedBook): void {
    this.router.navigate(['/explore', book.id, 'preview']).then(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  private mapToPreviewBook(data: BookDetails): PreviewBook {
    const descriptionList = data.description
      ? [data.description]
      : ['No description available for this book.'];

    return {
      id: data.id,
      title: data.title,
      author: data.author?.display_name || 'Unknown Author',
      categoryId: data.category?.id ?? null,
      category: data.category?.name || 'General',
      language: data.language || 'English',
      rating: data.average_rating ?? 0,
      reviewsCount: data.review_count ?? 0,
      pages: data.page_count && data.page_count > 0 ? data.page_count : null,
      readingTime:
        data.estimated_reading_time ||
        (data.page_count && data.page_count > 0
          ? data.page_count * 2 >= 60
            ? `${Math.floor((data.page_count * 2) / 60)} hours ${
                (data.page_count * 2) % 60 > 0 ? ((data.page_count * 2) % 60) + ' mins' : ''
              }`.trim()
            : `${data.page_count * 2} mins`
          : null),
      cover: data.cover_url || 'images/explore/architecture-of-logic.jpg',
      badge: 'Published',
      canDownload: data.can_download,
      description: descriptionList,
      authorInfo: {
        name: data.author?.display_name || 'Author',
        role: data.author?.username ? `@${data.author.username}` : 'BookHive Author',
        image: data.author?.profile_image_url || 'images/author/profile/profile-placeholder.jpg',
        biography: data.author?.biography || 'No author biography provided.',
      },
    };
  }

  private loadRelatedBooks(data: BookDetails): void {
    this.relatedBooks = [];
    this.isRelatedLoading = true;
    this.changeDetector.markForCheck();

    this.bookService
      .getCatalogue({
        page: 1,
        size: 8,
        category_id: data.category?.id,
      })
      .subscribe({
        next: (catalogue) => {
          const sameCategoryBooks = this.mapRelatedBooks(catalogue.items, data.id);

          if (sameCategoryBooks.length >= 3 || !data.category?.id) {
            this.relatedBooks = sameCategoryBooks;
            this.isRelatedLoading = false;
            this.changeDetector.markForCheck();
            return;
          }

          this.bookService
            .getCatalogue({
              page: 1,
              size: 10,
            })
            .subscribe({
              next: (fallbackCatalogue) => {
                const fallbackBooks = this.mapRelatedBooks(
                  fallbackCatalogue.items,
                  data.id,
                  sameCategoryBooks
                );
                this.relatedBooks = fallbackBooks;
                this.isRelatedLoading = false;
                this.changeDetector.markForCheck();
              },
              error: () => {
                this.relatedBooks = sameCategoryBooks;
                this.isRelatedLoading = false;
                this.changeDetector.markForCheck();
              },
            });
        },
        error: () => {
          this.bookService
            .getCatalogue({
              page: 1,
              size: 5,
            })
            .subscribe({
              next: (catalogue) => {
                this.relatedBooks = this.mapRelatedBooks(catalogue.items, data.id);
                this.isRelatedLoading = false;
                this.changeDetector.markForCheck();
              },
              error: () => {
                this.relatedBooks = [];
                this.isRelatedLoading = false;
                this.changeDetector.markForCheck();
              },
            });
        },
      });
  }

  private mapRelatedBooks(
    books: CatalogueBook[],
    currentBookId: number,
    seedBooks: RelatedBook[] = []
  ): RelatedBook[] {
    const seenIds = new Set(seedBooks.map((book) => book.id));
    const relatedBooks = [...seedBooks];

    for (const book of books) {
      if (book.id === currentBookId || seenIds.has(book.id)) {
        continue;
      }

      relatedBooks.push(this.mapRelatedBook(book));
      seenIds.add(book.id);

      if (relatedBooks.length >= 5) {
        break;
      }
    }

    return relatedBooks;
  }

  private mapRelatedBook(book: CatalogueBook): RelatedBook {
    return {
      id: book.id,
      title: book.title,
      author: book.author_name || 'Unknown Author',
      cover: book.cover_url || '',
      rating: book.rating ?? 0,
    };
  }

  private mapReviews(data: BookDetails): ReaderReview[] {
    if (!data.reviews || data.reviews.length === 0) {
      return [];
    }

    const currentUserId = this.currentUserId;

    return data.reviews.map((review: PublicReview) => ({
      id: review.id,
      userId: review.user_id,
      readerName: review.reader_name || review.user_name || 'Anonymous Reader',
      rating: review.rating,
      date: review.created_at
        ? new Date(review.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Recent',
      comment: review.comment || 'No written comment.',
      helpfulCount: 0,
      isOwnReview: currentUserId !== undefined && review.user_id === currentUserId,
    }));
  }
}
