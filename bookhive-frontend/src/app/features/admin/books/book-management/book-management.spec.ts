import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { BookManagement } from './book-management';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('BookManagement', () => {
  let component: BookManagement;
  let fixture: ComponentFixture<BookManagement>;
  let adminApi: AdminApiService;
  let toastService: ToastService;

  const samplePaginatedResponse = {
    items: [
      {
        id: 1,
        title: 'Beyond Good and Evil',
        author_name: 'F. Nietzsche',
        category_name: 'Philosophy',
        language: 'English',
        reading_level: 'Advanced',
        status: 'PUBLISHED',
        cover_image_path: 'storage/covers/1.jpg',
        page_count: 240,
        view_count: 1450,
        download_count: 320,
        average_rating: 4.8,
        review_count: 5,
        created_at: '2026-08-01T00:00:00Z',
        published_at: '2026-08-02T00:00:00Z',
      },
    ],
    total: 1,
    page: 1,
    page_size: 5,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookManagement],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        AdminApiService,
        ToastService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookManagement);
    component = fixture.componentInstance;
    adminApi = TestBed.inject(AdminApiService);
    toastService = TestBed.inject(ToastService);
  });

  it('should create and load books on init', () => {
    vi.spyOn(adminApi, 'getBooks').mockReturnValue(of(samplePaginatedResponse));
    component.ngOnInit();

    expect(adminApi.getBooks).toHaveBeenCalled();
    expect(component.booksSignal().length).toBe(1);
    expect(component.booksSignal()[0].title).toBe('Beyond Good and Evil');
    expect(component.booksSignal()[0].views).toBe('1,450');
    expect(component.booksSignal()[0].downloads).toBe('320');
    expect(component.booksSignal()[0].pageCount).toBe(240);
  });

  it('should update status and call updateBookStatus on toggle', () => {
    vi.spyOn(adminApi, 'getBooks').mockReturnValue(of(samplePaginatedResponse));
    vi.spyOn(adminApi, 'updateBookStatus').mockReturnValue(of({ message: 'Status updated' }));
    vi.spyOn(toastService, 'warning');

    component.ngOnInit();
    const book = component.booksSignal()[0];
    component.toggleBookActive(book);

    expect(adminApi.updateBookStatus).toHaveBeenCalledWith(1, 'DEACTIVATED');
    expect(toastService.warning).toHaveBeenCalled();
  });

  it('should handle API errors cleanly', () => {
    vi.spyOn(adminApi, 'getBooks').mockReturnValue(throwError(() => new Error('Server Error')));
    component.ngOnInit();

    expect(component.booksSignal().length).toBe(0);
    expect(component.totalBooksSignal()).toBe(0);
  });
});
