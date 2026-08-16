import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  ExploreFiltersComponent,
  ExploreFilterValues
} from './components/explore-filters/explore-filters';

import {
  Book,
  BookCardComponent
} from './components/book-card/book-card';

import {
  PaginationComponent
} from './components/pagination/pagination';

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'rating' | 'title';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    FormsModule,
    ExploreFiltersComponent,
    BookCardComponent,
    PaginationComponent
  ],
  templateUrl: './explore.html',
  styleUrl: './explore.scss'
})
export class ExploreComponent {
  private readonly router = inject(Router);
  viewMode: ViewMode = 'grid';
  sortOption: SortOption = 'popular';
  currentPage = 1;
  totalPages = 12;
  isLoading = false;

  activeFilters: ExploreFilterValues = {
    search: '',
    categories: ['Technology'],
    language: '',
    minimumRating: 4
  };

  readonly skeletonCards = [1, 2, 3];

  books: Book[] = [
    {
      id: 1,
      title: 'The Architecture of Logic',
      author: 'Jonathan Sterling',
      category: 'Technology',
      language: 'English',
      rating: 4.9,
      reviews: 124,
      pages: 342,
      cover: 'images/explore/architecture-of-logic.jpg',
      description:
        'Explore the foundational structures of human thought and modern logical systems.',
      badge: 'Premium'
    },
    {
      id: 2,
      title: 'Quantum Leadership',
      author: 'Sarah Valerius',
      category: 'Business',
      language: 'English',
      rating: 4.7,
      reviews: 98,
      pages: 280,
      cover: 'images/explore/quantum-leadership.jpg',
      description:
        'Redefining organizational dynamics through the lens of modern leadership.',
      badge: 'Free'
    },
    {
      id: 3,
      title: 'The Visual Narrative',
      author: 'Marcus Thorne',
      category: 'Design',
      language: 'English',
      rating: 5,
      reviews: 156,
      pages: 416,
      cover: 'images/explore/visual-narrative.jpg',
      description:
        'A comprehensive guide to visual storytelling, design and creative communication.',
      badge: 'Premium'
    }
  ];

  get filteredBooks(): Book[] {
    let result = [...this.books];

    const search = this.activeFilters.search.toLowerCase();

    if (search) {
      result = result.filter(book =>
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        book.category.toLowerCase().includes(search)
      );
    }

    if (this.activeFilters.categories.length > 0) {
      result = result.filter(book =>
        this.activeFilters.categories.includes(book.category)
      );
    }

    if (this.activeFilters.language) {
      result = result.filter(book =>
        book.language === this.activeFilters.language
      );
    }

    result = result.filter(book =>
      book.rating >= this.activeFilters.minimumRating
    );

    return this.sortBooks(result);
  }

  onFiltersChanged(filters: ExploreFilterValues): void {
    this.activeFilters = filters;
    this.currentPage = 1;
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  onSortChanged(): void {
    this.currentPage = 1;
  }

  onPageChanged(page: number): void {
    this.currentPage = page;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  onReadBook(book: Book): void {
    this.router.navigate(['/book-reader', book.id]);
  }

  onPreviewBook(book: Book): void {
    this.router.navigate(['/explore', book.id, 'preview']);
  }

  private sortBooks(books: Book[]): Book[] {
    switch (this.sortOption) {
      case 'rating':
        return books.sort((a, b) => b.rating - a.rating);

      case 'title':
        return books.sort((a, b) =>
          a.title.localeCompare(b.title)
        );

      case 'popular':
      default:
        return books.sort((a, b) =>
          b.reviews - a.reviews
        );
    }
  }
}
