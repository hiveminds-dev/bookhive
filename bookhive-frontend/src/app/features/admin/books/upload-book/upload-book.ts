import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-upload-book',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './upload-book.html',
  styleUrl: './upload-book.scss',
})
export class UploadBookComponent {
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  bookTitle = '';
  authorName = '';
  description = '';
  selectedCategory = '';
  selectedLanguage = 'English';
  readingLevel = 'Beginner';
  isbn = '';
  tagInput = '';

  readonly tagsSignal = signal<string[]>([]);
  readonly selectedBookFileName = signal<string | null>(null);
  readonly selectedCoverFileName = signal<string | null>(null);

  readonly categories = [
    'Fiction',
    'Non-Fiction',
    'Philosophy',
    'Science & Nature',
    'Art & Design',
    'History',
    'Technology',
    'Biography'
  ];

  readonly languages = ['English', 'Spanish', 'French', 'German', 'Japanese'];
  readonly readingLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  get charCount(): number {
    return this.description ? this.description.length : 0;
  }

  addTag(): void {
    const tag = this.tagInput.trim();
    if (tag && !this.tagsSignal().includes(tag)) {
      this.tagsSignal.update((current) => [...current, tag]);
      this.tagInput = '';
    }
  }

  removeTag(tagToRemove: string): void {
    this.tagsSignal.update((current) => current.filter((t) => t !== tagToRemove));
  }

  onFileSelected(event: Event, type: 'file' | 'cover'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const fileName = input.files[0].name;
      if (type === 'file') {
        this.selectedBookFileName.set(fileName);
      } else {
        this.selectedCoverFileName.set(fileName);
      }
      this.toastService.info(`Selected file: ${fileName}`, 'File Attached');
    }
  }

  saveDraft(): void {
    this.toastService.success('Book draft saved successfully!', 'Draft Saved');
  }

  submitForReview(): void {
    if (!this.bookTitle.trim()) {
      this.toastService.error('Please enter a book title.', 'Validation Error');
      return;
    }
    if (!this.authorName.trim()) {
      this.toastService.error('Please enter author name.', 'Validation Error');
      return;
    }

    this.toastService.success('Book submitted for review successfully!', 'Success');
    setTimeout(() => {
      this.router.navigate(['/admin/books']);
    }, 1000);
  }
}
