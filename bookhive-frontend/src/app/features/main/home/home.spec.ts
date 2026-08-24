import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  BookService,
  CategoryListResponse,
  PaginatedCatalogue,
} from '../../../core/services/book.service';
import { Home } from './home';

describe('Home Component', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let router: Router;
  let mockBookService: {
    getCatalogue: ReturnType<typeof vi.fn>;
    getCategories: ReturnType<typeof vi.fn>;
  };

  const sampleCatalogue: PaginatedCatalogue = {
    total_items: 2,
    total_pages: 1,
    current_page: 1,
    page_size: 8,
    items: [
      {
        id: 1,
        title: 'Beyond Good and Evil',
        description: 'A prelude to philosophy.',
        language: 'English',
        reading_level: 'Advanced',
        published_at: '2026-01-01',
        cover_url: '/storage/covers/cover_1.jpg',
        author_name: 'E. V. Sterling',
        category_name: 'Philosophy & Logic',
        page_count: 6,
      },
      {
        id: 2,
        title: 'Clean Architecture in Python',
        description: 'Design principles.',
        language: 'English',
        reading_level: 'Advanced',
        published_at: '2026-01-02',
        cover_url: null,
        author_name: 'Yuki Tanaka',
        category_name: 'Programming',
        page_count: 120,
      },
    ],
  };

  const sampleCategories: CategoryListResponse = {
    total: 2,
    page: 1,
    page_size: 10,
    items: [
      {
        id: 4,
        name: 'Philosophy & Logic',
        description: 'Classical & modern frameworks.',
        is_active: true,
      },
      {
        id: 5,
        name: 'Programming',
        description: 'Software engineering.',
        is_active: true,
      },
    ],
  };

  beforeEach(async () => {
    mockBookService = {
      getCatalogue: vi.fn().mockReturnValue(of(sampleCatalogue)),
      getCategories: vi.fn().mockReturnValue(of(sampleCategories)),
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: BookService, useValue: mockBookService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load catalogue books and categories on init', () => {
    expect(component).toBeTruthy();
    expect(mockBookService.getCatalogue).toHaveBeenCalledWith({ page: 1, size: 8 });
    expect(mockBookService.getCategories).toHaveBeenCalledWith(1, 10);
    expect(component.featuredBooks.length).toBe(2);
    expect(component.categories.length).toBe(2);
    expect(component.isLoadingFeatured).toBe(false);
    expect(component.isLoadingCategories).toBe(false);
  });

  it('should render highlighted book and category spotlight from real API data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Beyond Good and Evil');
    expect(compiled.textContent).toContain('By E. V. Sterling');
    expect(compiled.textContent).toContain('Philosophy & Logic');

    const highlightedImg = compiled.querySelector<HTMLImageElement>('.feature-book-img');
    expect(highlightedImg).not.toBeNull();
    expect(highlightedImg?.src).toContain('/storage/covers/cover_1.jpg');
    expect(highlightedImg?.alt).toBe('Beyond Good and Evil cover');

    const categoryLink = compiled.querySelector<HTMLAnchorElement>('.category-highlight-card .highlight-action-link');
    expect(categoryLink?.getAttribute('href')).toBe('/explore?category_id=4');
  });

  it('should switch highlighted book to placeholder on cover load error', () => {
    component.onHighlightedCoverError();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const highlightedImg = compiled.querySelector('.feature-book-img');
    expect(highlightedImg).toBeNull();

    const placeholder = compiled.querySelector('.book-highlight-card .book-cover-placeholder');
    expect(placeholder).not.toBeNull();
    expect(placeholder?.textContent).toContain('Beyond Good and Evil');
  });

  it('should handle error when loading featured books', () => {
    mockBookService.getCatalogue.mockReturnValue(throwError(() => new Error('Network error')));
    component.loadFeaturedBooks();

    expect(component.featuredBooks).toEqual([]);
    expect(component.isLoadingFeatured).toBe(false);
    expect(component.featuredHasError).toBe(true);
  });

  it('should handle error when loading categories', () => {
    mockBookService.getCategories.mockReturnValue(throwError(() => new Error('Network error')));
    component.loadCategories();

    expect(component.categories).toEqual([]);
    expect(component.isLoadingCategories).toBe(false);
    expect(component.categoriesHasError).toBe(true);
  });

  it('should navigate to explore with search query parameter', () => {
    component.onSearch('Nietzsche');

    expect(router.navigate).toHaveBeenCalledWith(['/explore'], {
      queryParams: { search: 'Nietzsche' },
    });
  });

  it('should navigate to explore on explore all click', () => {
    component.onExploreAll();

    expect(router.navigate).toHaveBeenCalledWith(['/explore']);
  });

  it('should navigate to community on join community click', () => {
    component.onJoinCommunity();

    expect(router.navigate).toHaveBeenCalledWith(['/community']);
  });
});
