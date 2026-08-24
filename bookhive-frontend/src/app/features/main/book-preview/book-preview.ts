import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { BookDetails, BookService, PublicReview } from '../../../core/services/book.service';
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
  category: string;
  language: string;
  rating: number;
  reviewsCount: number;
  pages: number;
  readingTime: string;
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
  private readonly changeDetector = inject(ChangeDetectorRef);

  private routeSubscription?: Subscription;

  bookId: number | null = null;
  book: PreviewBook | null = null;
  isLoading = false;
  notFound = false;
  hasServerError = false;
  errorMessage = '';

  readerReviews: ReaderReview[] = [];

  relatedBooks: RelatedBook[] = [
    {
      id: 2,
      title: 'Cognitive Structures',
      author: 'Emma Richardson',
      cover: 'images/related/cognitive-structures.jpg',
      rating: 4.6,
    },
    {
      id: 3,
      title: 'The Nature of Mind',
      author: 'Marcus Vale',
      cover: 'images/related/nature-of-mind.jpg',
      rating: 4.8,
    },
    {
      id: 4,
      title: 'Infinite Systems',
      author: 'Daniel Harrington',
      cover: 'images/related/infinite-systems.jpg',
      rating: 4.7,
    },
    {
      id: 5,
      title: 'Logic & Form',
      author: 'Sophia Bennett',
      cover: 'images/related/logic-and-form.jpg',
      rating: 4.5,
    },
    {
      id: 6,
      title: 'The Rational Language',
      author: 'Nathan Cole',
      cover: 'images/related/rational-language.jpg',
      rating: 4.9,
    },
  ];

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
    this.changeDetector.markForCheck();

    this.bookService.getBookDetails(bookId).subscribe({
      next: (data: BookDetails) => {
        this.book = this.mapToPreviewBook(data);
        this.readerReviews = this.mapReviews(data);
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.book = null;

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
    if (!this.book) {
      return;
    }
    console.log('Download book:', this.book.id);
  }

  onWriteReview(): void {
    if (!this.book) {
      return;
    }
    console.log('Write review for book:', this.book.id);
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
      category: data.category?.name || 'General',
      language: data.language || 'English',
      rating: data.average_rating ?? 0,
      reviewsCount: data.review_count ?? 0,
      pages: 350,
      readingTime: '7 hours',
      cover: data.cover_url || 'images/explore/architecture-of-logic.jpg',
      badge: 'Published',
      canDownload: data.can_download,
      description: descriptionList,
      authorInfo: {
        name: data.author?.display_name || 'Author',
        role: 'Author',
        image: data.author?.profile_image_url || 'images/author/profile/profile-placeholder.jpg',
        biography: data.author?.biography || 'No author biography provided.',
      },
    };
  }

  private mapReviews(data: BookDetails): ReaderReview[] {
    if (!data.reviews || data.reviews.length === 0) {
      return [];
    }

    return data.reviews.map((review: PublicReview) => ({
      id: review.id,
      readerName: review.user_name || 'Anonymous Reader',
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
    }));
  }
}
