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

  it('should create and initialize with books', () => {
    vi.advanceTimersByTime(200);
    expect(component).toBeTruthy();
    expect(component.books.length).toBe(3);
  });

  it('should start with grid view', () => {
    expect(component.viewMode).toBe('grid');
  });

  it('should change view modes', () => {
    component.setViewMode('list');
    expect(component.viewMode).toBe('list');

    component.setViewMode('grid');
    expect(component.viewMode).toBe('grid');
  });

  it('should filter books using search query matching Architecture', () => {
    vi.advanceTimersByTime(200);
    component.onFiltersChanged({
      search: 'Architecture',
      categories: [],
      language: '',
      minimumRating: 1,
    });

    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(component.filteredBooks.length).toBe(1);
    expect(component.filteredBooks[0].title).toBe('The Architecture of Logic');
  });

  it('should show 0 books for nonexistent search query zzzz-no-such-book', () => {
    vi.advanceTimersByTime(200);
    component.onFiltersChanged({
      search: 'zzzz-no-such-book',
      categories: [],
      language: '',
      minimumRating: 1,
    });

    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(component.filteredBooks.length).toBe(0);
  });

  it('should restore normal catalogue when search query is cleared', () => {
    vi.advanceTimersByTime(200);
    component.onFiltersChanged({
      search: 'Quantum',
      categories: [],
      language: '',
      minimumRating: 1,
    });
    vi.advanceTimersByTime(200);
    expect(component.filteredBooks.length).toBe(1);

    component.onFiltersChanged({
      search: '   ',
      categories: [],
      language: '',
      minimumRating: 1,
    });
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(component.filteredBooks.length).toBe(3);
  });

  it('should reset current page to 1 when search or filters change', () => {
    component.currentPage = 5;

    component.onFiltersChanged({
      search: 'Design',
      categories: [],
      language: '',
      minimumRating: 1,
    });

    expect(component.currentPage).toBe(1);
  });

  it('should handle rapid query changes without race conditions', () => {
    vi.advanceTimersByTime(200);
    mockBookService.getCatalogue.mockClear();

    component.onFiltersChanged({ search: 'A', categories: [], language: '', minimumRating: 1 });
    vi.advanceTimersByTime(50);
    component.onFiltersChanged({ search: 'Ar', categories: [], language: '', minimumRating: 1 });
    vi.advanceTimersByTime(50);
    component.onFiltersChanged({ search: 'Architecture', categories: [], language: '', minimumRating: 1 });
    vi.advanceTimersByTime(200);

    expect(mockBookService.getCatalogue).toHaveBeenCalled();
  });

  it('should filter books using category', () => {
    component.onFiltersChanged({
      search: '',
      categories: ['Design'],
      language: '',
      minimumRating: 1,
    });

    expect(component.filteredBooks.length).toBe(1);
    expect(component.filteredBooks[0].category).toBe('Design');
  });

  it('should sort books by title', () => {
    component.onFiltersChanged({
      search: '',
      categories: [],
      language: '',
      minimumRating: 1,
    });
    component.sortOption = 'title';

    const sortedBooks = component.filteredBooks;
    expect(sortedBooks[0].title).toBe('Quantum Leadership');
  });
});
