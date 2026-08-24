import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BookDetailsResult, BookService, PaginatedCatalogue } from './book.service';

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
        cover_url: 'test-cover.jpg',
        pdf_url: 'test.pdf',
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
    });

    const req = httpTesting.expectOne('/api/books/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch catalogue with filter parameters', () => {
    const mockCatalogue: PaginatedCatalogue = {
      total_items: 1,
      total_pages: 1,
      current_page: 1,
      page_size: 10,
      items: [
        {
          id: 1,
          title: 'Filtered Book',
          description: 'Desc',
          language: 'English',
          reading_level: 'Beginner',
          published_at: '2026-01-01',
          cover_url: null,
          author_name: 'Author',
          category_name: 'Tech',
        },
      ],
    };

    service.getCatalogue({ page: 2, size: 5, search: 'logic' }).subscribe((res) => {
      expect(res.items.length).toBe(1);
      expect(res.items[0].title).toBe('Filtered Book');
    });

    const req = httpTesting.expectOne(
      (request) =>
        request.url === '/api/catalogue/books' &&
        request.params.get('page') === '2' &&
        request.params.get('size') === '5' &&
        request.params.get('search') === 'logic',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCatalogue);
  });
});
