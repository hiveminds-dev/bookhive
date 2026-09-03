import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ActivatedRoute,
  provideRouter
} from '@angular/router';

import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Auth } from '../../../../core/services/auth';
import { AuthorBookItem, BookService } from '../../../../core/services/book.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EditBookComponent } from './edit-book';

describe('EditBookComponent', () => {
  let component: EditBookComponent;
  let fixture: ComponentFixture<EditBookComponent>;
  let bookServiceMock: {
    getCategories: ReturnType<typeof vi.fn>;
    createDraftBook: ReturnType<typeof vi.fn>;
    updateBook: ReturnType<typeof vi.fn>;
    uploadBookPdf: ReturnType<typeof vi.fn>;
    uploadBookCover: ReturnType<typeof vi.fn>;
    submitBook: ReturnType<typeof vi.fn>;
    getAuthorBookById: ReturnType<typeof vi.fn>;
  };
  let authMock: {
    currentUser: ReturnType<typeof vi.fn>;
  };
  let toastServiceMock: {
    success: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
  };

  const mockCategories = {
    items: [
      { id: 1, name: 'Philosophy', description: null, is_active: true },
      { id: 2, name: 'Fiction', description: null, is_active: true }
    ],
    total: 2,
    page: 1,
    page_size: 50
  };

  const mockCreatedBook: AuthorBookItem = {
    id: 42,
    author_id: 10,
    category_id: 1,
    title: 'Meditations on Solitude',
    description: 'A deep book.',
    language: 'English',
    reading_level: 'Beginner',
    pdf_path: 'storage/books/test.pdf',
    cover_image_path: 'storage/covers/test.jpg',
    status: 'DRAFT',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    submitted_at: null,
    published_at: null
  };

  beforeEach(async () => {
    bookServiceMock = {
      getCategories: vi.fn().mockReturnValue(of(mockCategories)),
      createDraftBook: vi.fn().mockReturnValue(of(mockCreatedBook)),
      updateBook: vi.fn().mockReturnValue(of(mockCreatedBook)),
      uploadBookPdf: vi.fn().mockReturnValue(of(mockCreatedBook)),
      uploadBookCover: vi.fn().mockReturnValue(of(mockCreatedBook)),
      submitBook: vi.fn().mockReturnValue(of({ id: 42, title: 'Meditations on Solitude', status: 'PENDING_REVIEW' })),
      getAuthorBookById: vi.fn().mockReturnValue(of(mockCreatedBook))
    };

    authMock = {
      currentUser: vi.fn().mockReturnValue({ id: 10, full_name: 'Eleanor Vance', email: 'eleanor.v@lumina.com' })
    };

    toastServiceMock = {
      success: vi.fn(),
      warning: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [EditBookComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        },
        { provide: BookService, useValue: bookServiceMock },
        { provide: Auth, useValue: authMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load categories', () => {
    expect(component).toBeTruthy();
    expect(bookServiceMock.getCategories).toHaveBeenCalled();
    expect(component.categories.length).toBe(2);
    expect((fixture.nativeElement as HTMLSelectElement).textContent).toContain('Philosophy');
  });

  it('should start in upload mode with author name pre-populated and read-only', () => {
    expect(component.isEditMode).toBe(false);
    expect(component.pageTitle).toBe('Upload Books');
    expect(component.bookForm.get('authorName')?.value).toBe('Eleanor Vance');
  });

  it('should validate required fields on submit', () => {
    component.submitForReview();
    expect(component.errorMessage).toContain('Please complete all required fields');
    expect(bookServiceMock.submitBook).not.toHaveBeenCalled();
  });

  it('should submit a complete book successfully with uploaded PDF and cover', () => {
    const dummyPdf = new File(['dummy pdf content'], 'book.pdf', { type: 'application/pdf' });
    const dummyCover = new File(['dummy cover content'], 'cover.jpg', { type: 'image/jpeg' });

    component.bookForm.patchValue({
      title: 'Meditations on Solitude',
      description: 'A thoughtful book on reflection.',
      category: '1',
      language: 'English',
      readingLevel: 'Beginner'
    });

    component.onBookFileSelected(dummyPdf);
    component.onCoverSelected(dummyCover);

    component.submitForReview();

    expect(bookServiceMock.createDraftBook).toHaveBeenCalled();
    expect(bookServiceMock.uploadBookCover).toHaveBeenCalledWith(42, dummyCover);
    expect(bookServiceMock.uploadBookPdf).toHaveBeenCalledWith(42, dummyPdf);
    expect(bookServiceMock.submitBook).toHaveBeenCalledWith(42);
    expect(toastServiceMock.success).toHaveBeenCalledWith(
      expect.stringContaining('submitted for review successfully'),
      'Submission Successful'
    );
  });

  it('should save a draft without submitting for review', () => {
    component.bookForm.patchValue({
      title: 'Work in Progress Manuscript',
      description: 'Drafting notes...',
      category: '1'
    });

    component.saveDraft();

    expect(bookServiceMock.createDraftBook).toHaveBeenCalled();
    expect(bookServiceMock.submitBook).not.toHaveBeenCalled();
    expect(toastServiceMock.success).toHaveBeenCalledWith(
      expect.stringContaining('Book draft created successfully'),
      'Draft Saved'
    );
  });
});
