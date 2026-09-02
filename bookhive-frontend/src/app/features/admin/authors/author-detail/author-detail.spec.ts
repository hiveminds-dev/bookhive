import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthorDetailComponent } from './author-detail';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('AuthorDetailComponent', () => {
  let component: AuthorDetailComponent;
  let fixture: ComponentFixture<AuthorDetailComponent>;
  let adminApi: AdminApiService;
  let toastService: ToastService;

  const sampleAuthor = {
    id: 15,
    full_name: 'Eleanor Vance',
    username: 'eleanorv',
    email: 'eleanor.v@lumina.com',
    account_status: 'pending',
    email_verified: true,
    created_at: '2026-07-20T10:00:00Z',
    pen_name: 'E. V. Sterling',
    country: 'United Kingdom',
    short_bio: 'Philosophy author',
    profile_image_path: 'storage/authors/15.jpg',
    total_books: 2,
    total_views: 3500,
    total_downloads: 1200,
    average_rating: 4.8,
    published_books: [
      {
        id: 1,
        title: 'Beyond Good and Evil',
        category_name: 'Philosophy',
        status: 'PUBLISHED',
        cover_image_path: 'storage/covers/1.jpg',
        view_count: 3500,
        download_count: 1200,
        average_rating: 4.8,
        rejection_reason: null,
        created_at: '2026-08-01T00:00:00Z',
        published_at: '2026-08-02T00:00:00Z',
      },
    ],
    pending_books: [],
    rejected_books: [],
    draft_books: [],
    rejection_logs: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: '15' } },
          },
        },
        AdminApiService,
        ToastService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorDetailComponent);
    component = fixture.componentInstance;
    adminApi = TestBed.inject(AdminApiService);
    toastService = TestBed.inject(ToastService);
  });

  it('should create and load author details on init', () => {
    vi.spyOn(adminApi, 'getAuthorDetail').mockReturnValue(of(sampleAuthor));
    component.ngOnInit();

    expect(adminApi.getAuthorDetail).toHaveBeenCalledWith(15);
    expect(component.author()).toBeTruthy();
    expect(component.author()?.full_name).toBe('Eleanor Vance');
    expect(component.author()?.pen_name).toBe('E. V. Sterling');
    expect(component.author()?.published_books.length).toBe(1);
    expect(component.formattedViews).toBe('3.5k');
    expect(component.formattedDownloads).toBe('1.2k');
  });

  it('should approve author credentials and update state', () => {
    vi.spyOn(adminApi, 'getAuthorDetail').mockReturnValue(of(sampleAuthor));
    vi.spyOn(adminApi, 'approveAuthor').mockReturnValue(of({ message: 'Author approved' }));
    vi.spyOn(toastService, 'success');

    component.ngOnInit();
    component.approveAuthor();

    expect(adminApi.approveAuthor).toHaveBeenCalledWith(15);
    expect(component.author()?.account_status).toBe('approved');
    expect(toastService.success).toHaveBeenCalled();
  });
});
