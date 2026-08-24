import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap } from 'rxjs';

import { BookService, PaginatedCatalogue } from '../../../core/services/book.service';
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
export class ExploreComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly bookService = inject(BookService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly searchSubject = new Subject<{ search: string; page: number }>();
  private searchSubscription?: Subscription;
  private routeSubscription?: Subscription;

  viewMode: ViewMode = 'grid';
  sortOption: SortOption = 'popular';
  currentPage = 1;
  totalPages = 12;
  totalBooksCount = 32587;
  isLoading = false;

  activeFilters: ExploreFilterValues = {
    search: '',
    categories: ['Technology'],
    language: '',
    minimumRating: 4
  };

  readonly skeletonCards = [1, 2, 3];

  readonly defaultBooks: Book[] = [
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

  books: Book[] = [...this.defaultBooks];

  ngOnInit(): void {
    // Setup reactive pipeline to handle rapid search queries with debounce and switchMap (prevents race conditions)
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(150),
        distinctUntilChanged((prev, curr) => prev.search === curr.search && prev.page === curr.page),
        switchMap(({ search, page }) => {
          this.isLoading = true;
          this.changeDetector.markForCheck();
          return this.bookService.getCatalogue({
            page,
            size: 12,
            search: search || undefined
          });
        })
      )
      .subscribe({
        next: (catalogue: PaginatedCatalogue) => {
          this.isLoading = false;
          if (catalogue.items && catalogue.items.length > 0) {
            this.books = catalogue.items.map((item) => ({
              id: item.id,
              title: item.title,
              author: item.author_name,
              category: item.category_name,
              language: item.language || 'English',
              rating: 4.8,
              reviews: 120,
              pages: 320,
              cover: item.cover_url || 'images/explore/architecture-of-logic.jpg',
              description: item.description || 'Explore this title on BookHive.',
              badge: 'Published',
            }));
            this.totalPages = Math.max(1, catalogue.total_pages);
            this.totalBooksCount = catalogue.total_items;
          } else {
            // When search query yields no results from API, check if default mock books match query; if not, empty
            if (this.activeFilters.search) {
              this.books = [];
              this.totalPages = 1;
              this.totalBooksCount = 0;
            } else {
              this.books = [...this.defaultBooks];
              this.totalPages = 1;
              this.totalBooksCount = this.defaultBooks.length;
            }
          }
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          // Fallback to local default books if API is not available
          this.books = [...this.defaultBooks];
          this.changeDetector.markForCheck();
        }
      });

    // Listen to route query parameters
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      const searchParam = (params['search'] ?? '').trim();
      if (searchParam !== this.activeFilters.search) {
        this.activeFilters = {
          ...this.activeFilters,
          search: searchParam
        };
        this.currentPage = 1;
      }
      this.triggerCatalogueSearch();
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  triggerCatalogueSearch(): void {
    const trimmed = (this.activeFilters.search || '').trim();
    this.searchSubject.next({ search: trimmed, page: this.currentPage });
  }

  get filteredBooks(): Book[] {
    let result = [...this.books];

    const search = this.activeFilters.search.toLowerCase().trim();

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
    const search = (filters.search || '').trim();
    this.activeFilters = {
      ...filters,
      search
    };
    this.currentPage = 1;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: search || null },
      queryParamsHandling: 'merge'
    });

    this.triggerCatalogueSearch();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  onSortChanged(): void {
    this.currentPage = 1;
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.triggerCatalogueSearch();

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
