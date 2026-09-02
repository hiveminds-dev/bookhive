import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { BookReviewComponent } from './book-review';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('BookReviewComponent', () => {
  let component: BookReviewComponent;
  let fixture: ComponentFixture<BookReviewComponent>;
  let adminApi: AdminApiService;
  let toastService: ToastService;

  const sampleBook = {
    id: 10,
    title: 'Quantum Computing Dynamics',
    author_name: 'Dr. Sarah Chen',
    category_name: 'Science',
    language: 'English',
    reading_level: 'Expert',
    status: 'PENDING_REVIEW',
    cover_image_path: 'storage/covers/10.jpg',
    pdf_path: 'storage/books/10.pdf',
    author_profile_image_path: 'storage/authors/10.jpg',
    page_count: 150,
    estimated_reading_time: '5 hours',
    view_count: 0,
    download_count: 0,
    isbn: null,
    average_rating: 0.0,
    review_count: 0,
    reviews: [],
    rejection_logs: [],
    created_at: '2026-08-10T12:00:00Z',
    published_at: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookReviewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: '10' } },
          },
        },
        AdminApiService,
        ToastService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookReviewComponent);
    component = fixture.componentInstance;
    adminApi = TestBed.inject(AdminApiService);
    toastService = TestBed.inject(ToastService);
  });

  it('should create and load book by id on init', () => {
    vi.spyOn(adminApi, 'getBookById').mockReturnValue(of(sampleBook));
    component.ngOnInit();

    expect(adminApi.getBookById).toHaveBeenCalledWith(10);
    expect(component.book).toBeTruthy();
    expect(component.book?.title).toBe('Quantum Computing Dynamics');
    expect(component.book?.status).toBe('PENDING_REVIEW');
  });

  it('should approve book successfully', () => {
    vi.spyOn(adminApi, 'getBookById').mockReturnValue(of(sampleBook));
    vi.spyOn(adminApi, 'approveBook').mockReturnValue(of({ message: 'Approved' }));
    vi.spyOn(toastService, 'success');

    component.ngOnInit();
    component.approvePublication();

    expect(adminApi.approveBook).toHaveBeenCalledWith(10);
    expect(component.book?.status).toBe('PUBLISHED');
    expect(toastService.success).toHaveBeenCalled();
  });

  it('should require rejection reason when rejecting', () => {
    vi.spyOn(adminApi, 'getBookById').mockReturnValue(of(sampleBook));
    vi.spyOn(adminApi, 'rejectBook');
    vi.spyOn(toastService, 'error');

    component.ngOnInit();
    component.promptReject();
    component.rejectionReasonSignal.set('');
    component.confirmReject();

    expect(adminApi.rejectBook).not.toHaveBeenCalled();
    expect(toastService.error).toHaveBeenCalledWith(
      'A rejection reason is mandatory when rejecting a book submission.',
      'Validation Error'
    );
  });

  it('should reject book successfully when reason provided', () => {
    vi.spyOn(adminApi, 'getBookById').mockReturnValue(of(sampleBook));
    vi.spyOn(adminApi, 'rejectBook').mockReturnValue(of({ message: 'Rejected' }));
    vi.spyOn(toastService, 'warning');

    component.ngOnInit();
    component.promptReject();
    component.rejectionReasonSignal.set('Incomplete manuscript formatting');
    component.confirmReject();

    expect(adminApi.rejectBook).toHaveBeenCalledWith(10, 'Incomplete manuscript formatting');
    expect(component.book?.status).toBe('REJECTED');
    expect(toastService.warning).toHaveBeenCalled();
  });
});
