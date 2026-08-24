import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBookOpen,
  LucideCompass,
  LucideLayers,
  LucideSparkles,
  LucideUsers,
} from '@lucide/angular';

import {
  BookService,
  CatalogueBook,
  CategoryItem,
  PaginatedCatalogue,
} from '../../../core/services/book.service';
import { CategoriesComponent } from './components/categories/categories';
import { CommunitySectionComponent } from './components/community-section/community-section';
import { FeaturedBooksComponent } from './components/featured-books/featured-books';
import { HeroComponent } from './components/hero/hero';
import { SearchComponent } from './components/search/search';
import { SubscriptionComponent } from './components/subscription/subscription';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    HeroComponent,
    SearchComponent,
    FeaturedBooksComponent,
    CategoriesComponent,
    CommunitySectionComponent,
    SubscriptionComponent,
    LucideBookOpen,
    LucideArrowRight,
    LucideSparkles,
    LucideLayers,
    LucideUsers,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  featuredBooks: CatalogueBook[] = [];
  categories: CategoryItem[] = [];

  isLoadingFeatured = false;
  featuredHasError = false;
  highlightedCoverFailed = false;

  isLoadingCategories = false;
  categoriesHasError = false;

  get highlightedBook(): CatalogueBook | null {
    return this.featuredBooks.length > 0 ? this.featuredBooks[0] : null;
  }

  get highlightedCategory(): CategoryItem | null {
    return this.categories.length > 0 ? this.categories[0] : null;
  }

  ngOnInit(): void {
    this.loadFeaturedBooks();
    this.loadCategories();
  }

  loadFeaturedBooks(): void {
    this.isLoadingFeatured = true;
    this.featuredHasError = false;
    this.highlightedCoverFailed = false;
    this.changeDetector.markForCheck();

    this.bookService.getCatalogue({ page: 1, size: 8 }).subscribe({
      next: (catalogue: PaginatedCatalogue) => {
        this.featuredBooks = catalogue.items || [];
        this.isLoadingFeatured = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.featuredBooks = [];
        this.isLoadingFeatured = false;
        this.featuredHasError = true;
        this.changeDetector.markForCheck();
      },
    });
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoriesHasError = false;
    this.changeDetector.markForCheck();

    this.bookService.getCategories(1, 10).subscribe({
      next: (response) => {
        this.categories = response.items || [];
        this.isLoadingCategories = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.categories = [];
        this.isLoadingCategories = false;
        this.categoriesHasError = true;
        this.changeDetector.markForCheck();
      },
    });
  }

  onHighlightedCoverError(): void {
    this.highlightedCoverFailed = true;
  }

  onSearch(query: string): void {
    const search = query.trim();
    void this.router.navigate(['/explore'], {
      queryParams: { search: search || null },
    });
  }

  onExploreAll(): void {
    void this.router.navigate(['/explore']);
  }

  onJoinCommunity(): void {
    void this.router.navigate(['/community']);
  }

  onRegister(): void {
    void this.router.navigate(['/register']);
  }
}
