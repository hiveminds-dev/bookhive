import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-author-book-cover-upload',
  standalone: true,
  imports: [],
  templateUrl: './book-cover-upload.html',
  styleUrl: './book-cover-upload.scss'
})
export class BookCoverUploadComponent {

  @Output() bookFileSelected =
    new EventEmitter<File>();

  @Output() coverSelected =
    new EventEmitter<File>();

  selectedBookFile?: File;
  selectedCover?: File;

  coverPreview = '';

  bookFileError = '';
  coverError = '';

  isBookDragActive = false;
  isCoverDragActive = false;

  readonly maximumBookSize =
    100 * 1024 * 1024;

  readonly maximumCoverSize =
    10 * 1024 * 1024;

  onBookFileChange(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (file) {
      this.processBookFile(file);
    }

    input.value = '';
  }

  onCoverChange(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (file) {
      this.processCover(file);
    }

    input.value = '';
  }

  onBookDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isBookDragActive = true;
  }

  onBookDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isBookDragActive = false;
  }

  onBookDrop(event: DragEvent): void {
    event.preventDefault();
    this.isBookDragActive = false;

    const file =
      event.dataTransfer?.files?.[0];

    if (file) {
      this.processBookFile(file);
    }
  }

  onCoverDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isCoverDragActive = true;
  }

  onCoverDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isCoverDragActive = false;
  }

  onCoverDrop(event: DragEvent): void {
    event.preventDefault();
    this.isCoverDragActive = false;

    const file =
      event.dataTransfer?.files?.[0];

    if (file) {
      this.processCover(file);
    }
  }

  removeBookFile(): void {
    this.selectedBookFile = undefined;
    this.bookFileError = '';
  }

  removeCover(): void {
    this.selectedCover = undefined;
    this.coverPreview = '';
    this.coverError = '';
  }

  private processBookFile(file: File): void {
    this.bookFileError = '';

    const extension =
      file.name.split('.').pop()?.toLowerCase();

    if (
      extension !== 'pdf' &&
      extension !== 'epub'
    ) {
      this.bookFileError =
        'Only PDF and EPUB files are allowed.';
      return;
    }

    if (file.size > this.maximumBookSize) {
      this.bookFileError =
        'The book file must be smaller than 100MB.';
      return;
    }

    this.selectedBookFile = file;
    this.bookFileSelected.emit(file);
  }

  private processCover(file: File): void {
    this.coverError = '';

    if (
      file.type !== 'image/png' &&
      file.type !== 'image/jpeg'
    ) {
      this.coverError =
        'Only PNG and JPG images are allowed.';
      return;
    }

    if (file.size > this.maximumCoverSize) {
      this.coverError =
        'The cover image must be smaller than 10MB.';
      return;
    }

    this.selectedCover = file;
    this.coverSelected.emit(file);

    const reader = new FileReader();

    reader.onload = () => {
      this.coverPreview =
        typeof reader.result === 'string'
          ? reader.result
          : '';
    };

    reader.readAsDataURL(file);
  }
}
