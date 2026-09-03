import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Auth } from '../../../core/services/auth';
import { AuthorBookItem, BookService } from '../../../core/services/book.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthenticatedUser } from '../../auth/models/login';
import { AuthorDashboardComponent } from './dashboard';

describe('AuthorDashboardComponent', () => {
  let component: AuthorDashboardComponent;
  let fixture: ComponentFixture<AuthorDashboardComponent>;
  let currentUserSignal: ReturnType<typeof signal<AuthenticatedUser | null>>;

  const authorBooks: AuthorBookItem[] = [
    {
      id: 1,
      author_id: 1,
      category_id: 1,
      title: 'Published Work',
      description: 'Published description',
      language: 'English',
      reading_level: 'Beginner',
      pdf_path: 'storage/books/published.pdf',
      cover_image_path: 'storage/covers/published.jpg',
      cover_url: '/storage/covers/published.jpg',
      status: 'PUBLISHED',
      created_at: '2026-08-01T00:00:00Z',
      updated_at: '2026-08-01T00:00:00Z',
      submitted_at: '2026-08-01T00:00:00Z',
      published_at: '2026-08-02T00:00:00Z'
    },
    {
      id: 2,
      author_id: 1,
      category_id: 2,
      title: 'Pending Work',
      description: 'Pending description',
      language: 'English',
      reading_level: 'Intermediate',
      pdf_path: 'storage/books/pending.pdf',
      cover_image_path: null,
      status: 'PENDING_REVIEW',
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
      submitted_at: '2026-09-01T00:00:00Z',
      published_at: null
    }
  ];

  beforeEach(async () => {
    currentUserSignal = signal<AuthenticatedUser | null>({
      id: 1,
      full_name: 'Eleanor Vance',
      username: 'eleanorv',
      email: 'eleanor.v@lumina.com',
      role: 'author',
      account_status: 'approved',
      email_verified: true,
    });

    await TestBed.configureTestingModule({
      imports: [AuthorDashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            currentUser: currentUserSignal.asReadonly(),
          },
        },
        {
          provide: BookService,
          useValue: {
            getAuthorBooks: vi.fn().mockReturnValue(of(authorBooks))
          }
        },
        {
          provide: ToastService,
          useValue: {
            warning: vi.fn()
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the authenticated author first name', () => {
    expect(component.authorFirstName()).toBe('Eleanor');
  });

  it('should fallback to Author if full_name is empty', () => {
    currentUserSignal.set(null);
    fixture.detectChanges();

    expect(component.authorFirstName()).toBe('Author');
  });

  it('should contain four statistics', () => {
    expect(component.statistics.length).toBe(4);
  });

  it('should load real book counts and recent books', () => {
    expect(component.statistics[0].value).toBe('2');
    expect(component.statistics[1].value).toBe('1');
    expect(component.statistics[2].value).toBe('1');
    expect(component.recentBooks.map((book) => book.title)).toEqual([
      'Pending Work',
      'Published Work'
    ]);
  });

  it('should not display fabricated reviews', () => {
    expect(component.recentReviews).toEqual([]);
  });

  it('should not display fabricated activities', () => {
    expect(component.activities).toEqual([]);
  });
});
