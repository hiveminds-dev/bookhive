import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import { of } from 'rxjs';
import { vi } from 'vitest';

import { AuthorBookItem, BookService } from '../../../../core/services/book.service';
import { ToastService } from '../../../../core/services/toast.service';
import { BookManagementComponent } from './book-management';

describe('BookManagementComponent', () => {
  let component: BookManagementComponent;
  let fixture: ComponentFixture<BookManagementComponent>;
  let bookServiceMock: {
    getAuthorBooks: ReturnType<typeof vi.fn>;
    deleteAuthorBook: ReturnType<typeof vi.fn>;
  };
  let toastServiceMock: {
    success: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
  };

  const mockAuthorBooks: AuthorBookItem[] = [
    {
      id: 1,
      author_id: 10,
      category_id: 1,
      title: 'Meditations on Solitude',
      category_name: 'Philosophy',
      description: 'Desc',
      language: 'English',
      reading_level: 'Beginner',
      pdf_path: 'storage/books/meditations.pdf',
      cover_image_path: 'storage/covers/meditations.jpg',
      cover_url: '/storage/covers/meditations.jpg',
      status: 'PUBLISHED',
      created_at: '2023-10-12T00:00:00Z',
      updated_at: '2023-10-12T00:00:00Z',
      submitted_at: '2023-10-12T00:00:00Z',
      published_at: '2023-10-12T00:00:00Z'
    },
    {
      id: 2,
      author_id: 10,
      category_id: 2,
      title: 'The Ethical Arc',
      category_name: 'Ethics',
      description: 'Desc',
      language: 'English',
      reading_level: 'Intermediate',
      pdf_path: 'storage/books/ethical-arc.pdf',
      cover_image_path: 'storage/covers/ethical-arc.jpg',
      cover_url: '/storage/covers/ethical-arc.jpg',
      status: 'DRAFT',
      created_at: '2023-11-04T00:00:00Z',
      updated_at: '2023-11-04T00:00:00Z',
      submitted_at: null,
      published_at: null
    }
  ];

  beforeEach(async () => {
    bookServiceMock = {
      getAuthorBooks: vi.fn().mockReturnValue(of(mockAuthorBooks)),
      deleteAuthorBook: vi.fn().mockReturnValue(of({ message: 'Book deleted successfully' }))
    };

    toastServiceMock = {
      success: vi.fn(),
      warning: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BookManagementComponent],
      providers: [
        provideRouter([]),
        { provide: BookService, useValue: bookServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      BookManagementComponent
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load author books', () => {
    expect(component).toBeTruthy();
    expect(bookServiceMock.getAuthorBooks).toHaveBeenCalled();
    expect(component.books.length).toBe(2);
  });

  it('should filter published books', () => {
    component.onStatusChanged('Published');

    expect(component.filteredBooks.length).toBe(1);
    expect(component.filteredBooks[0].status).toBe('Published');
  });

  it('should filter books by title', () => {
    component.onSearchChanged('Ethical');

    expect(component.filteredBooks.length).toBe(1);
    expect(component.filteredBooks[0].title).toBe('The Ethical Arc');
  });

  it('should reset the page when filters change', () => {
    component.currentPage = 3;
    component.onStatusChanged('Draft');
    expect(component.currentPage).toBe(1);
  });
});
