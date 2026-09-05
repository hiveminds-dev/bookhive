import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Subscription, switchMap } from 'rxjs';

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

  private routeSubscription?: Subscription;

  viewMode: ViewMode = 'grid';
  sortOption: SortOption = 'popular';
  currentPage = 1;
  totalPages = 1;
  totalBooksCount = 0;
  isLoading = false;
  hasError = false;
  errorMessage = '';

  categoryList: { id?: number; name: string }[] = [];

  activeFilters: ExploreFilterValues = {
    search: '',
    categories: [],
    language: '',
    minimumRating: 1
  };

  readonly skeletonCards = [1, 2, 3, 4, 5, 6];

  books: Book[] = [];

  ngOnInit(): void {
    this.bookService.getCategories(1, 100).subscribe({
      next: (res) => {
        if (res?.items) {
          this.categoryList = res.items.map(c => ({ id: c.id, name: c.name }));
          this.changeDetector.markForCheck();
        }
      },
      error: () => {
        // Fallback to default categories if API fails
      }
    });

    // URL query parameters are the single authoritative source of truth for catalogue requests
    this.routeSubscription = this.route.queryParams
      .pipe(
        map((params) => {
          const search = (params['search'] ?? '').trim();
          const rawPage = Number(params['page']);
          const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
          const rawCategoryId = Number(params['category_id'] ?? params['categoryId']);
          const categoryId = Number.isInteger(rawCategoryId) && rawCategoryId > 0 ? rawCategoryId : undefined;
          const language = (params['language'] ?? '').trim();
          return { search, page, categoryId, language };
        }),
        distinctUntilChanged((prev, curr) =>
          prev.search === curr.search &&
          prev.page === curr.page &&
          prev.categoryId === curr.categoryId &&
          prev.language === curr.language
        ),
        debounceTime(150),
        switchMap(({ search, page, categoryId, language }) => {
          this.activeFilters = {
            ...this.activeFilters,
            search,
            language: language || this.activeFilters.language,
          };
          this.currentPage = page;
          this.isLoading = true;
          this.hasError = false;
          this.errorMessage = '';
          this.changeDetector.markForCheck();

          return this.bookService.getCatalogue({
            page,
            size: 12,
            search: search || undefined,
            category_id: categoryId,
            language: language || undefined,
          });
        })
      )
      .subscribe({
        next: (catalogue: PaginatedCatalogue) => {
          this.isLoading = false;
          this.hasError = false;
          if (catalogue.items && catalogue.items.length > 0) {
            this.books = catalogue.items.map((item) => ({
              id: item.id,
              title: item.title,
              author: item.author_name,
              category: item.category_name,
              language: item.language || 'English',
              rating: item.rating ?? null,
              reviews: item.review_count !== undefined ? item.review_count : null,
              pages: item.page_count ?? null,
              cover: item.cover_url || 'images/explore/architecture-of-logic.jpg',
              description: item.description || 'Explore this title on BookHive.',
              badge: 'Published',
            }));
            this.totalPages = Math.max(1, catalogue.total_pages);
            this.totalBooksCount = catalogue.total_items;
          } else {
            this.books = [];
            this.totalPages = 1;
            this.totalBooksCount = 0;
          }
          this.changeDetector.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          this.hasError = true;
          this.books = [];
          this.totalBooksCount = 0;
          this.totalPages = 1;
          this.errorMessage =
            err?.status === 0
              ? 'Unable to connect to BookHive server. Please check your connection.'
              : 'Failed to retrieve books from the catalogue. Please try again.';
          this.changeDetector.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
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
        book.language.toLowerCase() === this.activeFilters.language.toLowerCase()
      );
    }

    if (this.activeFilters.minimumRating > 1) {
      result = result.filter(book =>
        book.rating !== undefined &&
        book.rating !== null &&
        book.rating >= this.activeFilters.minimumRating
      );
    }

    return this.sortBooks(result);
  }

  onFiltersChanged(filters: ExploreFilterValues): void {
    const search = (filters.search || '').trim();
    this.activeFilters = {
      ...filters,
      search
    };

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: search || null,
        language: filters.language || null,
        page: null
      },
      queryParamsHandling: 'merge'
    });
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  onSortChanged(): void {
    this.currentPage = 1;
  }

  onPageChanged(page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: page > 1 ? page : null
      },
      queryParamsHandling: 'merge'
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  retry(): void {
    this.onFiltersChanged(this.activeFilters);
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
        return books.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

      case 'title':
        return books.sort((a, b) =>
          a.title.localeCompare(b.title)
        );

      case 'popular':
      default:
        return books.sort((a, b) =>
          (b.reviews ?? 0) - (a.reviews ?? 0)
        );
    }
  }
}
