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
  BookFormComponent
} from './components/book-form/book-form';

import {
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

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  readonly bookId =
    this.route.snapshot.paramMap.get('id');

  readonly isEditMode =
    this.bookId !== null;

  selectedBookFile?: File;
  selectedCover?: File;

  bookFileRequiredError = false;
  coverRequiredError = false;

  isSavingDraft = false;
  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  readonly bookForm =
    this.formBuilder.nonNullable.group({
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      authorName: [
        '',
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
      ? 'Update your book details and submit the changes for review.'
      : 'Upload your book, add details, and submit it for review.';
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.loadBookForEditing();
    }
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
    if (
      this.isSavingDraft ||
      this.isSubmitting
    ) {
      return;
    }

    this.clearMessages();
    this.isSavingDraft = true;

    const draftData = {
      ...this.bookForm.getRawValue(),
      bookId: this.bookId,
      bookFile: this.selectedBookFile,
      cover: this.selectedCover,
      status: 'Draft'
    };

    console.log('Save draft:', draftData);

    setTimeout(() => {
      this.isSavingDraft = false;

      this.successMessage =
        'Your book draft was saved successfully.';
    }, 700);
  }

  submitForReview(): void {
    if (
      this.isSavingDraft ||
      this.isSubmitting
    ) {
      return;
    }

    this.clearMessages();

    this.bookForm.markAllAsTouched();

    this.bookFileRequiredError =
      !this.isEditMode &&
      !this.selectedBookFile;

    this.coverRequiredError =
      !this.isEditMode &&
      !this.selectedCover;

    if (
      this.bookForm.invalid ||
      this.bookFileRequiredError ||
      this.coverRequiredError
    ) {
      this.errorMessage =
        'Please complete all required fields and upload the required files.';

      this.scrollToFirstError();
      return;
    }

    this.isSubmitting = true;

    const submissionData = {
      ...this.bookForm.getRawValue(),
      bookId: this.bookId,
      bookFile: this.selectedBookFile,
      cover: this.selectedCover,
      status: 'Pending'
    };

    console.log(
      'Submit book for review:',
      submissionData
    );

    setTimeout(() => {
      this.isSubmitting = false;

      this.successMessage =
        'Your book was submitted for review successfully.';
    }, 900);
  }

  private loadBookForEditing(): void {
    /*
     * Backend connect කළාම:
     * GET /api/author/books/:id
     */

    this.bookForm.patchValue({
      title: 'Meditations on Solitude',
      authorName: 'Marcus Aurelius',
      description:
        'A philosophical exploration of solitude, reflection, and personal growth.',
      category: 'Philosophy',
      language: 'English',
      readingLevel: 'Intermediate',
      isbn: '9781234567890',
      tags:
        'philosophy, solitude, personal growth'
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

    firstInvalidElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}
