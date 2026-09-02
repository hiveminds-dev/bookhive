import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  Auth
} from '../../../../core/services/auth';

import {
  BookService,
  CategoryItem
} from '../../../../core/services/book.service';

import {
  ToastService
} from '../../../../core/services/toast.service';

import {
  BookFormComponent
} from './components/book-form/book-form';

import {
  CategoryOption,
  CategorySelectComponent
} from './components/category-select/category-select';

import {
  BookCoverUploadComponent
} from './components/book-cover-upload/book-cover-upload';

import {
  BookDetailsComponent
} from './components/book-details/book-details';

import {
  SaveActionsComponent
} from './components/save-actions/save-actions';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    BookFormComponent,
    CategorySelectComponent,
    BookCoverUploadComponent,
    BookDetailsComponent,
    SaveActionsComponent
  ],
  templateUrl: './edit-book.html',
  styleUrl: './edit-book.scss'
})
export class EditBookComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  private readonly bookService = inject(BookService);
  private readonly toastService = inject(ToastService);

  readonly bookId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = this.bookId !== null;

  createdBookId: number | null = this.bookId ? Number(this.bookId) : null;

  categories: CategoryOption[] = [];
  selectedBookFile?: File;
  selectedCover?: File;

  existingCoverUrl?: string | null;
  existingPdfName?: string | null;
  bookStatus?: string | null;
  rejectionReason?: string | null;

  bookFileRequiredError = false;
  coverRequiredError = false;

  isSavingDraft = false;
  isSubmitting = false;
  isLoading = false;

  successMessage = '';
  errorMessage = '';

  readonly bookForm = this.formBuilder.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        Validators.maxLength(150)
      ]
    ],

    authorName: [
      this.getAuthorDisplayName(),
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    description: [
      '',
      [
        Validators.required,
        Validators.maxLength(500)
      ]
    ],

    category: [
      '',
      Validators.required
    ],

    language: [
      'English',
      Validators.required
    ],

    readingLevel: [
      'Beginner',
      Validators.required
    ],

    isbn: [
      '',
      Validators.pattern(
        /^(?:\d{10}|\d{13})$/
      )
    ],

    tags: ['']
  });

  get pageTitle(): string {
    return this.isEditMode
      ? 'Edit Book'
      : 'Upload Books';
  }

  get pageDescription(): string {
    return this.isEditMode
      ? 'Update your book details, upload revisions, and submit for review.'
      : 'Upload your book, add details, and submit it for review.';
  }

  ngOnInit(): void {
    this.loadCategories();
    this.bookForm.patchValue({
      authorName: this.getAuthorDisplayName()
    });

    if (this.isEditMode && this.createdBookId) {
      this.loadBookForEditing(this.createdBookId);
    }
  }

  private getAuthorDisplayName(): string {
    const user = this.auth.currentUser();
    return user?.full_name || 'Author';
  }

  loadCategories(): void {
    this.bookService.getCategories(1, 100).subscribe({
      next: (response) => {
        if (response && response.items) {
          this.categories = response.items.map((cat: CategoryItem) => ({
            id: cat.id,
            name: cat.name
          }));
        }
      },
      error: () => {
        this.toastService.warning('Failed to load categories.', 'Notice');
      }
    });
  }

  onBookFileSelected(file: File): void {
    this.selectedBookFile = file;
    this.bookFileRequiredError = false;
  }

  onCoverSelected(file: File): void {
    this.selectedCover = file;
    this.coverRequiredError = false;
  }

  saveDraft(): void {
    if (this.isSavingDraft || this.isSubmitting) {
      return;
    }

    this.clearMessages();

    const raw = this.bookForm.getRawValue();
    if (!raw.title.trim()) {
      this.errorMessage = 'Please enter a book title to save as draft.';
      return;
    }

    const categoryId = Number(raw.category) || (this.categories.length > 0 ? this.categories[0].id : 1);

    this.isSavingDraft = true;

    if (this.createdBookId) {
      // Update existing draft
      this.bookService.updateBook(this.createdBookId, {
        title: raw.title.trim(),
        description: raw.description.trim() || null,
        category_id: categoryId,
        language: raw.language,
        reading_level: raw.readingLevel
      }).subscribe({
        next: (book) => {
          this.uploadFilesAndFinish(book.id, false, 'Book draft updated successfully.');
        },
        error: (err) => {
          this.isSavingDraft = false;
          this.errorMessage = err.error?.detail || 'Failed to update book draft.';
          this.toastService.warning(this.errorMessage, 'Error');
        }
      });
    } else {
      // Create new draft
      this.bookService.createDraftBook({
        title: raw.title.trim(),
        description: raw.description.trim() || null,
        category_id: categoryId,
        language: raw.language,
        reading_level: raw.readingLevel
      }).subscribe({
        next: (book) => {
          this.createdBookId = book.id;
          this.uploadFilesAndFinish(book.id, false, 'Book draft created successfully.');
        },
        error: (err) => {
          this.isSavingDraft = false;
          this.errorMessage = err.error?.detail || 'Failed to save book draft.';
          this.toastService.warning(this.errorMessage, 'Error');
        }
      });
    }
  }

  submitForReview(): void {
    if (this.isSavingDraft || this.isSubmitting) {
      return;
    }

    this.clearMessages();
    this.bookForm.markAllAsTouched();

    const hasBookFile = Boolean(this.selectedBookFile || this.existingPdfName);
    const hasCover = Boolean(this.selectedCover || this.existingCoverUrl);

    this.bookFileRequiredError = !hasBookFile;
    this.coverRequiredError = !hasCover;

    if (
      this.bookForm.invalid ||
      this.bookFileRequiredError ||
      this.coverRequiredError
    ) {
      this.errorMessage =
        'Please complete all required fields and upload the required PDF and cover files.';
      this.scrollToFirstError();
      return;
    }

    this.isSubmitting = true;
    const raw = this.bookForm.getRawValue();
    const categoryId = Number(raw.category);

    if (this.createdBookId) {
      // Update metadata first, then upload any pending files, then submit
      this.bookService.updateBook(this.createdBookId, {
        title: raw.title.trim(),
        description: raw.description.trim(),
        category_id: categoryId,
        language: raw.language,
        reading_level: raw.readingLevel
      }).subscribe({
        next: (book) => {
          this.uploadFilesAndFinish(book.id, true, 'Your book was submitted for review successfully.');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.detail || 'Failed to update book details before submission.';
          this.toastService.warning(this.errorMessage, 'Error');
        }
      });
    } else {
      // Create draft first, then upload files, then submit
      this.bookService.createDraftBook({
        title: raw.title.trim(),
        description: raw.description.trim(),
        category_id: categoryId,
        language: raw.language,
        reading_level: raw.readingLevel
      }).subscribe({
        next: (book) => {
          this.createdBookId = book.id;
          this.uploadFilesAndFinish(book.id, true, 'Your book was submitted for review successfully.');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.detail || 'Failed to create book.';
          this.toastService.warning(this.errorMessage, 'Error');
        }
      });
    }
  }

  private uploadFilesAndFinish(bookId: number, doSubmit: boolean, successText: string): void {
    const uploadCover$ = this.selectedCover
      ? this.bookService.uploadBookCover(bookId, this.selectedCover)
      : null;

    const uploadPdf$ = this.selectedBookFile
      ? this.bookService.uploadBookPdf(bookId, this.selectedBookFile)
      : null;

    const finalize = () => {
      if (doSubmit) {
        this.bookService.submitBook(bookId).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.successMessage = successText;
            this.toastService.success(successText, 'Submission Successful');
            setTimeout(() => {
              this.router.navigate(['/author/books']);
            }, 1000);
          },
          error: (err) => {
            this.isSubmitting = false;
            this.errorMessage = err.error?.detail || 'Failed to submit book for review.';
            this.toastService.warning(this.errorMessage, 'Submission Failed');
          }
        });
      } else {
        this.isSavingDraft = false;
        this.successMessage = successText;
        this.toastService.success(successText, 'Draft Saved');
      }
    };

    if (uploadCover$ && uploadPdf$) {
      uploadCover$.subscribe({
        next: () => {
          uploadPdf$.subscribe({
            next: () => finalize(),
            error: (err) => this.handleUploadError(err, doSubmit)
          });
        },
        error: (err) => this.handleUploadError(err, doSubmit)
      });
    } else if (uploadCover$) {
      uploadCover$.subscribe({
        next: () => finalize(),
        error: (err) => this.handleUploadError(err, doSubmit)
      });
    } else if (uploadPdf$) {
      uploadPdf$.subscribe({
        next: () => finalize(),
        error: (err) => this.handleUploadError(err, doSubmit)
      });
    } else {
      finalize();
    }
  }

  private handleUploadError(err: any, doSubmit: boolean): void {
    if (doSubmit) {
      this.isSubmitting = false;
    } else {
      this.isSavingDraft = false;
    }
    this.errorMessage = err.error?.detail || 'Failed to upload files.';
    this.toastService.warning(this.errorMessage, 'Upload Error');
  }

  private loadBookForEditing(bookId: number): void {
    this.isLoading = true;
    this.bookService.getAuthorBookById(bookId).subscribe({
      next: (book) => {
        this.isLoading = false;
        this.bookStatus = book.status;
        this.rejectionReason = book.rejection_reason;
        this.existingCoverUrl = book.cover_url || (book.cover_image_path ? `/${book.cover_image_path}` : null);
        this.existingPdfName = book.pdf_path ? book.pdf_path.split('/').pop() : null;

        this.bookForm.patchValue({
          title: book.title || '',
          description: book.description || '',
          category: book.category_id ? String(book.category_id) : '',
          language: book.language || 'English',
          readingLevel: book.reading_level || 'Beginner',
          authorName: this.getAuthorDisplayName()
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || 'Could not load book details.';
        this.toastService.warning(this.errorMessage, 'Error');
      }
    });
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private scrollToFirstError(): void {
    const firstInvalidElement =
      document.querySelector(
        '.ng-invalid'
      ) as HTMLElement | null;

    if (firstInvalidElement && typeof firstInvalidElement.scrollIntoView === 'function') {
      firstInvalidElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
}
