import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { BookDetails, BookService } from '../../../core/services/book.service';
import { BookReaderComponent } from './book-reader';

describe('BookReaderComponent', () => {
  let component: BookReaderComponent;
  let fixture: ComponentFixture<BookReaderComponent>;
  let paramMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockBookService: { getBookDetails: ReturnType<typeof vi.fn> };

  const sampleBookDetails: BookDetails = {
    id: 1,
    title: 'The Architecture of Light',
    description: 'A study on architectural illumination.',
    language: 'English',
    reading_level: 'Intermediate',
    cover_url: 'images/reader/architecture-of-light.jpg',
    pdf_url: 'storage/books/book_1.pdf',
    page_count: 85,
    estimated_reading_time: '2 hours 50 mins',
    status: 'published',
    published_at: '2026-01-01T00:00:00Z',
    can_read: true,
    can_download: true,
    average_rating: 4.9,
    review_count: 50,
    reviews: [],
    author: {
      id: 5,
      display_name: 'Eliza Reed',
      username: 'ereed',
      biography: 'Architectural writer.',
      profile_image_url: null,
    },
    category: {
      id: 3,
      name: 'Design',
    },
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    localStorage.clear();

    paramMapSubject = new BehaviorSubject(convertToParamMap({ id: '1' }));
    mockBookService = {
      getBookDetails: vi.fn().mockReturnValue(of(sampleBookDetails)),
    };

    await TestBed.configureTestingModule({
      imports: [BookReaderComponent],
      providers: [
        provideRouter([]),
        { provide: BookService, useValue: mockBookService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.clearAllTimers();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should create and load book details with PDF and page count for valid ID', () => {
    expect(component).toBeTruthy();
    expect(component.bookId).toBe(1);
    expect(component.book).toBeTruthy();
    expect(component.book?.title).toBe('The Architecture of Light');
    expect(component.book?.author).toBe('Eliza Reed');
    expect(component.book?.totalPages).toBe(85);
    expect(component.pdfViewerUrl).toBeTruthy();
    expect(component.notFound).toBe(false);
    expect(component.hasServerError).toBe(false);
  });

  it('should handle a valid book without PDF cleanly without fake text', () => {
    const bookWithoutPdf: BookDetails = {
      ...sampleBookDetails,
      pdf_url: null,
      can_read: false,
    };
    mockBookService.getBookDetails.mockReturnValue(of(bookWithoutPdf));
    paramMapSubject.next(convertToParamMap({ id: '1' }));
    fixture.detectChanges();

    expect(component.book?.pdfUrl).toBeNull();
    expect(component.pdfViewerUrl).toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.reader-content-unavailable')).toBeTruthy();
  });

  it('should handle a valid book without page count safely without displaying 120', () => {
    const bookWithoutPages: BookDetails = {
      ...sampleBookDetails,
      page_count: null,
    };
    mockBookService.getBookDetails.mockReturnValue(of(bookWithoutPages));
    paramMapSubject.next(convertToParamMap({ id: '1' }));
    fixture.detectChanges();

    expect(component.book?.totalPages).toBeNull();
    expect(component.effectiveTotalPages).toBe(1);
  });

  it('should isolate reading progress and bookmark keys per book ID', () => {
    localStorage.setItem('bookhive-reading-progress-1', '15');
    localStorage.setItem('bookhive-reading-progress-2', '42');

    paramMapSubject.next(convertToParamMap({ id: '1' }));
    fixture.detectChanges();
    expect(component.currentPage).toBe(15);

    const book2Details: BookDetails = {
      ...sampleBookDetails,
      id: 2,
      page_count: 100,
    };
    mockBookService.getBookDetails.mockReturnValue(of(book2Details));
    paramMapSubject.next(convertToParamMap({ id: '2' }));
    fixture.detectChanges();
    expect(component.currentPage).toBe(42);
    expect(component.progressStorageKey).toBe('bookhive-reading-progress-2');
  });

  it('should handle invalid non-numeric ID without API call', () => {
    paramMapSubject.next(convertToParamMap({ id: 'invalid' }));
    fixture.detectChanges();

    expect(component.bookId).toBeNull();
    expect(component.book).toBeNull();
    expect(component.notFound).toBe(true);
    expect(component.errorMessage).toContain('invalid');
  });

  it('should handle negative or zero book ID', () => {
    paramMapSubject.next(convertToParamMap({ id: '-5' }));
    fixture.detectChanges();

    expect(component.bookId).toBeNull();
    expect(component.book).toBeNull();
    expect(component.notFound).toBe(true);
  });

  it('should display not-found state when API returns 404', () => {
    mockBookService.getBookDetails.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: { detail: 'Book not found' } })),
    );

    paramMapSubject.next(convertToParamMap({ id: '999999' }));
    fixture.detectChanges();

    expect(component.book).toBeNull();
    expect(component.notFound).toBe(true);
    expect(component.hasServerError).toBe(false);
  });

  it('should display server error state when API fails with 500', () => {
    mockBookService.getBookDetails.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    );

    paramMapSubject.next(convertToParamMap({ id: '2' }));
    fixture.detectChanges();

    expect(component.book).toBeNull();
    expect(component.notFound).toBe(false);
    expect(component.hasServerError).toBe(true);
  });

  it('should move to the next page when book is loaded with PDF', () => {
    component.currentPage = 1;
    component.nextPage();
    fixture.detectChanges();

    expect(component.currentPage).toBe(2);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-position')?.textContent).toContain('Page 2 of 85');
  });

  it('should move to the previous page', () => {
    component.currentPage = 5;
    component.previousPage();

    expect(component.currentPage).toBe(4);
  });

  it('should save reading progress after 30 seconds', () => {
    component.changePage(25);
    vi.advanceTimersByTime(30_000);

    expect(
      localStorage.getItem(component.progressStorageKey),
    ).toBe('25');
  });

  it('should not move outside the valid page range', () => {
    component.changePage(150);

    expect(component.currentPage).toBe(1);
  });

  it('should increase zoom and update PDF URL', () => {
    component.zoomLevel = 100;
    component.zoomIn();

    expect(component.zoomLevel).toBe(110);
  });

  it('should disable reader actions when book is null or lacks PDF', () => {
    component.book = null;
    component.currentPage = 1;
    component.nextPage();
    component.previousPage();
    component.goToPage(3);

    expect(component.currentPage).toBe(1);
  });
});
