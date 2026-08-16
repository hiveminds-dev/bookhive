import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { BookCoverComponent } from './components/book-cover/book-cover';
import { BookHeaderComponent } from './components/book-header/book-header';
import { BookInfoComponent } from './components/book-info/book-info';
import { BookActionsComponent } from './components/book-actions/book-actions';
import { BookDescriptionComponent } from './components/book-description/book-description';
import { AuthorInfoComponent } from './components/author-info/author-info';

import {
  ReaderReview,
  ReviewsComponent
} from './components/reviews/reviews';

import {
  RelatedBook,
  RelatedBooksComponent
} from './components/related-books/related-books';

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
    RouterLink,
    BookCoverComponent,
    BookHeaderComponent,
    BookInfoComponent,
    BookActionsComponent,
    BookDescriptionComponent,
    AuthorInfoComponent,
    ReviewsComponent,
    RelatedBooksComponent
  ],
  templateUrl: './book-preview.html',
  styleUrl: './book-preview.scss'
})
export class BookPreviewComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  bookId = Number(this.route.snapshot.paramMap.get('id')) || 1;

  isLoading = false;

  book: PreviewBook = {
    id: this.bookId,
    title: 'The Architecture of Logic',
    author: 'Jonathan Sterling',
    category: 'Philosophy & Science',
    language: 'English',
    rating: 4.8,
    reviewsCount: 342,
    pages: 352,
    readingTime: '7 hours',
    cover: 'images/explore/architecture-of-logic.jpg',
    badge: 'Premium',
    canDownload: true,

    description: [
      'The Architecture of Logic is a profound exploration into the structural foundations of human reasoning. Jonathan Sterling dissects how logic is not merely a cognitive tool, but a spatial framework through which we construct our understanding of reality.',

      'From the classical syllogisms of Aristotle to the complex neural networks of modern artificial intelligence, Sterling traces the evolution of logical thought as an architectural endeavor. He argues that every great idea is built upon a scaffold of invisible principles, and by understanding this architecture, we gain the ability to challenge ideas and construct more robust intellectual frameworks.'
    ],

    authorInfo: {
      name: 'Jonathan Sterling',
      role: 'Professor of Logic, Cambridge',
      image: 'images/authors/jonathan-sterling.jpg',
      biography:
        'Jonathan Sterling is a renowned philosopher specializing in logic and human reasoning. His work explores the relationship between abstract thought and the structures that shape our understanding.'
    }
  };

  readerReviews: ReaderReview[] = [
    {
      id: 1,
      readerName: 'Anonymous Reader',
      rating: 5,
      date: 'August 15, 2026',
      comment:
        'A masterclass of clarity. Sterling takes incredibly dense concepts and makes them feel intuitive. The chapter on paradoxes changed my perspective on problem-solving entirely.',
      helpfulCount: 24
    }
  ];

  relatedBooks: RelatedBook[] = [
    {
      id: 2,
      title: 'Cognitive Structures',
      author: 'Emma Richardson',
      cover: 'images/related/cognitive-structures.jpg',
      rating: 4.6
    },
    {
      id: 3,
      title: 'The Nature of Mind',
      author: 'Marcus Vale',
      cover: 'images/related/nature-of-mind.jpg',
      rating: 4.8
    },
    {
      id: 4,
      title: 'Infinite Systems',
      author: 'Daniel Harrington',
      cover: 'images/related/infinite-systems.jpg',
      rating: 4.7
    },
    {
      id: 5,
      title: 'Logic & Form',
      author: 'Sophia Bennett',
      cover: 'images/related/logic-and-form.jpg',
      rating: 4.5
    },
    {
      id: 6,
      title: 'The Rational Language',
      author: 'Nathan Cole',
      cover: 'images/related/rational-language.jpg',
      rating: 4.9
    }
  ];

  onReadBook(): void {
    this.router.navigate(['/book-reader', this.book.id]);
  }

  onDownloadBook(): void {
    console.log('Download book:', this.book.id);
  }

  onWriteReview(): void {
    console.log('Write review for book:', this.book.id);
  }

  onRelatedBookSelected(book: RelatedBook): void {
    this.router.navigate(['/explore', book.id, 'preview'])
      .then(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
  }
}
