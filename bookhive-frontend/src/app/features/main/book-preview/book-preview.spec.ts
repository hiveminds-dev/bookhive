import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { BookDetails, BookService } from '../../../core/services/book.service';
import { BookPreviewComponent } from './book-preview';

describe('BookPreviewComponent', () => {
  let component: BookPreviewComponent;
  let fixture: ComponentFixture<BookPreviewComponent>;
  let paramMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockBookService: { getBookDetails: ReturnType<typeof vi.fn> };

  const sampleBookDetails: BookDetails = {
    id: 1,
    title: 'The Architecture of Logic',
    description: 'A deep dive into logical reasoning.',
    language: 'English',
    reading_level: 'Advanced',
    cover_url: 'images/explore/architecture-of-logic.jpg',
    pdf_url: 'storage/books/book_1.pdf',
    status: 'published',
    published_at: '2026-01-15T00:00:00Z',
    can_read: true,
    can_download: true,
    average_rating: 4.8,
    review_count: 342,
    reviews: [
      {
        id: 1,
        user_name: 'Anonymous Reader',
        avatar_letter: 'A',
        rating: 5,
        comment: 'A masterclass of clarity.',
        created_at: '2026-08-15T00:00:00Z',
      },
    ],
    author: {
      id: 10,
      display_name: 'Jonathan Sterling',
      username: 'jsterling',
      biography: 'Renowned philosopher specializing in logic.',
      profile_image_url: 'images/authors/jonathan-sterling.jpg',
    },
    category: {
      id: 2,
      name: 'Philosophy & Science',
    },
  };

  beforeEach(async () => {
    paramMapSubject = new BehaviorSubject(convertToParamMap({ id: '1' }));
    mockBookService = {
      getBookDetails: vi.fn().mockReturnValue(of(sampleBookDetails)),
    };

    await TestBed.configureTestingModule({
      imports: [BookPreviewComponent],
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

    fixture = TestBed.createComponent(BookPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and display book details for valid ID', () => {
    expect(component.bookId).toBe(1);
    expect(component.book).toBeTruthy();
    expect(component.book?.title).toBe('The Architecture of Logic');
    expect(component.book?.author).toBe('Jonathan Sterling');
    expect(component.book?.category).toBe('Philosophy & Science');
    expect(component.notFound).toBe(false);
    expect(component.hasServerError).toBe(false);
    expect(component.readerReviews.length).toBe(1);
  });

  it('should handle invalid non-numeric ID without API call', () => {
    paramMapSubject.next(convertToParamMap({ id: 'invalid-id' }));
    fixture.detectChanges();

    expect(component.bookId).toBeNull();
    expect(component.book).toBeNull();
    expect(component.notFound).toBe(true);
    expect(component.errorMessage).toContain('invalid');
  });

  it('should handle negative or zero book ID', () => {
    paramMapSubject.next(convertToParamMap({ id: '0' }));
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
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' })),
    );

    paramMapSubject.next(convertToParamMap({ id: '5' }));
    fixture.detectChanges();

    expect(component.book).toBeNull();
    expect(component.notFound).toBe(false);
    expect(component.hasServerError).toBe(true);
  });

  it('should not perform read action when book is null', () => {
    component.book = null;
    const routerSpy = vi.spyOn((component as any).router, 'navigate');

    component.onReadBook();

    expect(routerSpy).not.toHaveBeenCalled();
  });
});
