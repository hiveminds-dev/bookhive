import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ReaderDetailComponent } from './reader-detail';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('ReaderDetailComponent', () => {
  let component: ReaderDetailComponent;
  let fixture: ComponentFixture<ReaderDetailComponent>;
  let adminApi: AdminApiService;

  const sampleReader = {
    id: 7,
    full_name: 'Liam Henderson',
    username: 'liamh',
    email: 'liam.henderson@mail.com',
    account_status: 'active',
    email_verified: true,
    joined_at: '2026-08-15T12:00:00Z',
    country: 'United Kingdom',
    short_bio: 'Philosophy enthusiast',
    review_count: 1,
    reviews: [
      {
        id: 1,
        book_id: 1,
        book_title: 'Beyond Good and Evil',
        book_cover_url: '/storage/covers/1.jpg',
        book_author: 'F. Nietzsche',
        rating: 5,
        comment: 'Brilliant masterpiece',
        created_at: '2026-08-20T10:00:00Z',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReaderDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: '7' } },
          },
        },
        AdminApiService,
        ToastService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReaderDetailComponent);
    component = fixture.componentInstance;
    adminApi = TestBed.inject(AdminApiService);
  });

  it('should create and load reader details on init', () => {
    vi.spyOn(adminApi, 'getReaderDetail').mockReturnValue(of(sampleReader));
    component.ngOnInit();

    expect(adminApi.getReaderDetail).toHaveBeenCalledWith(7);
    expect(component.reader()).toBeTruthy();
    expect(component.reader()?.full_name).toBe('Liam Henderson');
    expect(component.reader()?.reviews.length).toBe(1);
  });

  it('should generate initials properly', () => {
    expect(component.getInitials('Liam Henderson')).toBe('LH');
    expect(component.getInitials('Marcus')).toBe('MA');
    expect(component.getInitials('')).toBe('RD');
  });
});
