import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { BookService, PaginatedCatalogue } from '../../../core/services/book.service';
import { ExploreComponent } from './explore';

describe('ExploreComponent', () => {
  let component: ExploreComponent;
  let fixture: ComponentFixture<ExploreComponent>;
  let queryParamsSubject: BehaviorSubject<Record<string, string>>;
  let mockBookService: { getCatalogue: ReturnType<typeof vi.fn> };

  const sampleCatalogue: PaginatedCatalogue = {
    total_items: 3,
    total_pages: 1,
    current_page: 1,
    page_size: 10,
    items: [
      {
        id: 1,
        title: 'The Architecture of Logic',
        description: 'Explore logic systems.',
        language: 'English',
        reading_level: 'Advanced',
        page_count: 342,
        rating: 4.9,
        review_count: 124,
        published_at: '2026-01-01',
        cover_url: 'images/explore/architecture-of-logic.jpg',
        author_name: 'Jonathan Sterling',
        category_name: 'Technology',
      },
      {
        id: 2,
        title: 'Quantum Leadership',
        description: 'Organizational dynamics.',
        language: 'English',
        reading_level: 'Intermediate',
        page_count: null,
        rating: null,
        review_count: 0,
        published_at: '2026-01-02',
        cover_url: 'images/explore/quantum-leadership.jpg',
        author_name: 'Sarah Valerius',
        category_name: 'Business',
      },
      {
        id: 3,
        title: 'The Visual Narrative',
        description: 'Visual storytelling.',
        language: 'English',
        reading_level: 'Beginner',
        page_count: 416,
        rating: 5,
        review_count: 156,
        published_at: '2026-01-03',
        cover_url: 'images/explore/visual-narrative.jpg',
        author_name: 'Marcus Thorne',
        category_name: 'Design',
      },
    ],
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    queryParamsSubject = new BehaviorSubject<Record<string, string>>({});
    mockBookService = {
      getCatalogue: vi.fn().mockReturnValue(of(sampleCatalogue)),
    };

    await TestBed.configureTestingModule({
      imports: [ExploreComponent],
      providers: [
        provideRouter([]),
        { provide: BookService, useValue: mockBookService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
            snapshot: {
              paramMap: convertToParamMap({}),
              queryParamMap: convertToParamMap({}),
              queryParams: {},
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should create and initialize with books from catalogue', () => {
    vi.advanceTimersByTime(200);
    expect(component).toBeTruthy();
    expect(component.books.length).toBe(3);
    expect(mockBookService.getCatalogue).toHaveBeenCalledTimes(1);
  });

  it('should initialize search state from query parameters', () => {
    queryParamsSubject.next({ search: 'Architecture' });
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(component.activeFilters.search).toBe('Architecture');
  });

  it('should trigger exactly one request per search change', () => {
    vi.advanceTimersByTime(200);
    mockBookService.getCatalogue.mockClear();

    queryParamsSubject.next({ search: 'Quantum' });
    vi.advanceTimersByTime(200);

    expect(mockBookService.getCatalogue).toHaveBeenCalledTimes(1);
    expect(mockBookService.getCatalogue).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'Quantum', page: 1 }),
    );
  });

  it('should trigger exactly one request per page change', () => {
    vi.advanceTimersByTime(200);
    mockBookService.getCatalogue.mockClear();

    queryParamsSubject.next({ page: '2' });
    vi.advanceTimersByTime(200);

    expect(mockBookService.getCatalogue).toHaveBeenCalledTimes(1);
    expect(mockBookService.getCatalogue).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });

  it('should handle rapid query changes by debouncing and cancelling stale requests', () => {
    vi.advanceTimersByTime(200);
    mockBookService.getCatalogue.mockClear();

    queryParamsSubject.next({ search: 'A' });
    vi.advanceTimersByTime(50);
    queryParamsSubject.next({ search: 'Ar' });
    vi.advanceTimersByTime(50);
    queryParamsSubject.next({ search: 'Architecture' });
    vi.advanceTimersByTime(200);

    expect(mockBookService.getCatalogue).toHaveBeenCalledTimes(1);
    expect(mockBookService.getCatalogue).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'Architecture' }),
    );
  });

  it('should restore normal catalogue when search query is cleared', () => {
    vi.advanceTimersByTime(200);
    queryParamsSubject.next({ search: 'Quantum' });
    vi.advanceTimersByTime(200);
    fixture.detectChanges();
    expect(component.filteredBooks.length).toBe(1);

    queryParamsSubject.next({ search: '' });
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(component.filteredBooks.length).toBe(3);
  });

  it('should show 0 books for nonexistent search query zzzz-no-such-book', () => {
    mockBookService.getCatalogue.mockReturnValue(
      of({ total_items: 0, total_pages: 0, current_page: 1, page_size: 10, items: [] }),
    );
    queryParamsSubject.next({ search: 'zzzz-no-such-book' });
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(component.filteredBooks.length).toBe(0);
    expect(component.totalBooksCount).toBe(0);
  });

  it('should preserve real metadata on mapped books without invented statistics', () => {
    vi.advanceTimersByTime(200);
    const book1 = component.books.find((b) => b.id === 1);
    const book2 = component.books.find((b) => b.id === 2);

    expect(book1?.pages).toBe(342);
    expect(book1?.rating).toBe(4.9);
    expect(book1?.reviews).toBe(124);

    expect(book2?.pages).toBeNull();
    expect(book2?.rating).toBeNull();
    expect(book2?.reviews).toBe(0);
  });
});
