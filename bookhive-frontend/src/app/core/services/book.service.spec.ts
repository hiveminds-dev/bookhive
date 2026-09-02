import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  AuthorBookItem,
  AuthorBookListResult,
  AuthorBookResult,
  AuthorBookStatusResult,
  BookDetailsResult,
  BookService,
  PaginatedCatalogue
} from './book.service';

describe('BookService', () => {
  let service: BookService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BookService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(BookService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch book details by id', () => {
    const mockResponse: BookDetailsResult = {
      message: 'Book details retrieved successfully',
      data: {
        id: 1,
        title: 'Test Book',
        description: 'Test Description',
        language: 'English',
        reading_level: 'Intermediate',
        cover_url: '/storage/covers/test-cover.jpg',
        pdf_url: '/storage/books/test.pdf',
        status: 'published',
        published_at: '2026-01-01T00:00:00Z',
        page_count: 240,
        estimated_reading_time: '8 hours',
        can_read: true,
        can_download: true,
        average_rating: 4.5,
        review_count: 10,
        reviews: [],
        author: {
          id: 1,
          display_name: 'Author Name',
          username: 'author',
          biography: 'Bio',
          profile_image_url: null,
        },
        category: {
          id: 1,
          name: 'Fiction',
        },
      },
    };

    service.getBookDetails(1).subscribe((book) => {
      expect(book.title).toBe('Test Book');
      expect(book.id).toBe(1);
      expect(book.cover_url).toBe('/storage/covers/test-cover.jpg');
    });

    const req = httpTesting.expectOne('/api/books/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a draft book', () => {
    const mockBook: AuthorBookItem = {
      id: 10,
      author_id: 1,
      category_id: 2,
      title: 'New Draft',
      description: 'Draft description',
      language: 'English',
      reading_level: 'Beginner',
      pdf_path: null,
      cover_image_path: null,
      status: 'DRAFT',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      submitted_at: null,
      published_at: null,
    };

    const mockResponse: AuthorBookResult = {
      message: 'Draft book created successfully',
      data: mockBook,
    };

    service
      .createDraftBook({
        title: 'New Draft',
        category_id: 2,
        description: 'Draft description',
      })
      .subscribe((data) => {
        expect(data.id).toBe(10);
        expect(data.title).toBe('New Draft');
        expect(data.status).toBe('DRAFT');
      });

    const req = httpTesting.expectOne('/api/books/');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should submit a book for review', () => {
    const mockResponse: AuthorBookStatusResult = {
      message: 'Book submitted for review successfully',
      data: {
        id: 10,
        title: 'New Draft',
        status: 'PENDING_REVIEW',
        submitted_at: '2026-01-01T12:00:00Z',
      },
    };

    service.submitBook(10).subscribe((data) => {
      expect(data.id).toBe(10);
      expect(data.status).toBe('PENDING_REVIEW');
    });

    const req = httpTesting.expectOne('/api/books/10/submit');
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });

  it('should fetch author books from /api/books/mine', () => {
    const mockBooks: AuthorBookItem[] = [
      {
        id: 1,
        author_id: 1,
        category_id: 2,
        title: 'Book One',
        description: 'Desc',
        language: 'English',
        reading_level: 'Beginner',
        pdf_path: null,
        cover_image_path: null,
        status: 'PUBLISHED',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        submitted_at: null,
        published_at: '2026-01-01T00:00:00Z',
      },
    ];

    const mockResponse: AuthorBookListResult = {
      message: 'Author books retrieved successfully',
      data: mockBooks,
    };

    service.getAuthorBooks('Published').subscribe((books) => {
      expect(books.length).toBe(1);
      expect(books[0].title).toBe('Book One');
    });

    const req = httpTesting.expectOne(
      (r) => r.url === '/api/books/mine' && r.params.get('status') === 'PUBLISHED'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should delete author book', () => {
    service.deleteAuthorBook(5).subscribe((res) => {
      expect(res.message).toBe('Book deleted successfully');
    });

    const req = httpTesting.expectOne('/api/books/5');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Book deleted successfully' });
  });

  it('should fetch catalogue with filters', () => {
    const mockCatalogue: PaginatedCatalogue = {
      total_items: 1,
      total_pages: 1,
      current_page: 1,
      page_size: 10,
      items: [
        {
          id: 1,
          title: 'Filtered Title',
          description: 'Desc',
          language: 'English',
          reading_level: 'All',
          published_at: null,
          cover_url: null,
          author_name: 'Author Name',
          category_name: 'Science',
        },
      ],
    };

    service
      .getCatalogue({ page: 1, size: 10, search: 'Test', category_id: 3, language: 'English' })
      .subscribe((res) => {
        expect(res.total_items).toBe(1);
        expect(res.items[0].title).toBe('Filtered Title');
      });

    const req = httpTesting.expectOne((r) =>
      r.url === '/api/catalogue/books' &&
      r.params.get('search') === 'Test' &&
      r.params.get('category_id') === '3' &&
      r.params.get('language') === 'English'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCatalogue);
  });

  it('should create a review', () => {
    service.createReview(10, { rating: 5, comment: 'Amazing' }).subscribe((rev) => {
      expect(rev.id).toBe(1);
      expect(rev.rating).toBe(5);
    });

    const req = httpTesting.expectOne('/api/books/10/reviews');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ rating: 5, comment: 'Amazing' });
    req.flush({
      message: 'Review submitted successfully',
      data: { id: 1, rating: 5, comment: 'Amazing', reader_name: 'reader1', created_at: '2026-01-01' },
    });
  });

  it('should update a review', () => {
    service.updateReview(1, { rating: 4, comment: 'Good' }).subscribe((rev) => {
      expect(rev.rating).toBe(4);
    });

    const req = httpTesting.expectOne('/api/reviews/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ rating: 4, comment: 'Good' });
    req.flush({
      message: 'Review updated successfully',
      data: { id: 1, rating: 4, comment: 'Good', reader_name: 'reader1', created_at: '2026-01-01' },
    });
  });

  it('should delete a review', () => {
    service.deleteReview(1).subscribe((res) => {
      expect(res.message).toBe('Review deleted successfully');
    });

    const req = httpTesting.expectOne('/api/reviews/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Review deleted successfully' });
  });

  it('should get reader review for a book', () => {
    service.getMyBookReview(10).subscribe((rev) => {
      expect(rev?.rating).toBe(5);
    });

    const req = httpTesting.expectOne('/api/books/10/reviews/mine');
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'User review retrieved successfully',
      data: { id: 1, rating: 5, comment: 'Amazing', reader_name: 'reader1', created_at: '2026-01-01' },
    });
  });
});
