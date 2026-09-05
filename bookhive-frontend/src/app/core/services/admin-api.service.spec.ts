import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminApiService } from './admin-api.service';

describe('AdminApiService', () => {
  let service: AdminApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AdminApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch dashboard stats from /api/admin/dashboard/stats', () => {
    const mockStats = {
      total_books: 20,
      total_readers: 10,
      total_authors: 5,
      total_admins: 2,
      book_requests: 3,
      author_requests: 1,
    };

    service.getDashboardStats().subscribe((data) => {
      expect(data).toEqual(mockStats);
    });

    const req = httpMock.expectOne('/api/admin/dashboard/stats');
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('should fetch single book details via getBookById', () => {
    const mockBook = {
      id: 5,
      title: 'Dynamic Book',
      author_name: 'Author Name',
      category_name: 'Philosophy',
      language: 'English',
      reading_level: 'Advanced',
      status: 'PUBLISHED',
      cover_image_path: 'storage/covers/5.jpg',
      view_count: 100,
      download_count: 25,
      average_rating: 4.5,
      review_count: 3,
      created_at: '2026-08-30T10:00:00Z',
      published_at: '2026-08-31T10:00:00Z',
    };

    service.getBookById(5).subscribe((data) => {
      expect(data.id).toBe(5);
      expect(data.view_count).toBe(100);
      expect(data.download_count).toBe(25);
    });

    const req = httpMock.expectOne('/api/admin/books/5');
    expect(req.request.method).toBe('GET');
    req.flush(mockBook);
  });

  it('should approve book submission via approveBook', () => {
    service.approveBook(5).subscribe((res) => {
      expect(res.message).toBe('Book approved and published.');
    });

    const req = httpMock.expectOne('/api/admin/books/5/approve');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Book approved and published.' });
  });

  it('should reject book submission via rejectBook with mandatory reason', () => {
    service.rejectBook(5, 'Cover image is corrupted').subscribe((res) => {
      expect(res.message).toBe('Book rejected.');
    });

    const req = httpMock.expectOne('/api/admin/books/5/reject');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      status: 'REJECTED',
      rejection_reason: 'Cover image is corrupted',
    });
    req.flush({ message: 'Book rejected.' });
  });

  it('should fetch reader detail via getReaderDetail', () => {
    const mockReader = {
      id: 7,
      full_name: 'Liam Henderson',
      username: 'liamh',
      email: 'liam.henderson@mail.com',
      account_status: 'active',
      email_verified: true,
      joined_at: '2026-08-15T12:00:00Z',
      review_count: 1,
      reviews: [],
    };

    service.getReaderDetail(7).subscribe((data) => {
      expect(data.id).toBe(7);
      expect(data.full_name).toBe('Liam Henderson');
    });

    const req = httpMock.expectOne('/api/admin/readers/7');
    expect(req.request.method).toBe('GET');
    req.flush(mockReader);
  });

  it('should fetch author detail via getAuthorDetail', () => {
    const mockAuthor = {
      id: 12,
      full_name: 'Eleanor Vance',
      username: 'eleanorv',
      email: 'eleanor.v@lumina.com',
      account_status: 'approved',
      email_verified: true,
      created_at: '2026-07-20T10:00:00Z',
      pen_name: 'E. V. Sterling',
      total_books: 3,
      total_views: 1200,
      total_downloads: 400,
      average_rating: 4.8,
      published_books: [],
      pending_books: [],
      rejected_books: [],
      draft_books: [],
      rejection_logs: [],
    };

    service.getAuthorDetail(12).subscribe((data) => {
      expect(data.id).toBe(12);
      expect(data.pen_name).toBe('E. V. Sterling');
      expect(data.total_books).toBe(3);
    });

    const req = httpMock.expectOne('/api/admin/authors/12');
    expect(req.request.method).toBe('GET');
    req.flush(mockAuthor);
  });

  it('should request book changes via requestBookChanges', () => {
    service.requestBookChanges(5, 'Please fix typos').subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.message).toBe('Change request sent.');
    });

    const req = httpMock.expectOne('/api/admin/books/5/request-changes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ feedback: 'Please fix typos' });
    req.flush({ success: true, message: 'Change request sent.' });
  });

  it('should update reader status via updateReaderStatus', () => {
    service.updateReaderStatus(7, 'suspended').subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.message).toBe('Reader suspended.');
    });

    const req = httpMock.expectOne('/api/admin/readers/7/status');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'suspended' });
    req.flush({ success: true, message: 'Reader suspended.' });
  });

  it('should send reader password reset via resetReaderPassword', () => {
    service.resetReaderPassword(7).subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.message).toBe('Password reset email sent.');
    });

    const req = httpMock.expectOne('/api/admin/readers/7/reset-password');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: 'Password reset email sent.' });
  });

  it('should update author status via updateAuthorStatus', () => {
    service.updateAuthorStatus(12, 'suspended').subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.message).toBe('Author suspended.');
    });

    const req = httpMock.expectOne('/api/admin/authors/12/status');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'suspended' });
    req.flush({ success: true, message: 'Author suspended.' });
  });

  it('should send author password reset via resetAuthorPassword', () => {
    service.resetAuthorPassword(12).subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.message).toBe('Password reset email sent.');
    });

    const req = httpMock.expectOne('/api/admin/authors/12/reset-password');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: 'Password reset email sent.' });
  });
});
