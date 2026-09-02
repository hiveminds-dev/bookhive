import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-author-book-cover-upload',
  standalone: true,
  imports: [],
  templateUrl: './book-cover-upload.html',
  styleUrl: './book-cover-upload.scss'
})
export class BookCoverUploadComponent implements OnChanges {

  @Input() initialCoverUrl?: string | null;
  @Input() initialBookFileName?: string | null;

  @Output() bookFileSelected =
    new EventEmitter<File>();

  @Output() coverSelected =
    new EventEmitter<File>();

  selectedBookFile?: File;
  selectedCover?: File;

  coverPreview = '';
  existingCoverUrl = '';

  bookFileError = '';
  coverError = '';

  isBookDragActive = false;
  isCoverDragActive = false;

  readonly maximumBookSize =
    100 * 1024 * 1024;

  readonly maximumCoverSize =
    10 * 1024 * 1024;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialCoverUrl'] && this.initialCoverUrl && !this.selectedCover) {
      this.existingCoverUrl = this.initialCoverUrl;
      this.coverPreview = this.initialCoverUrl;
    }
  }

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
    this.coverPreview = this.existingCoverUrl || '';
    this.coverError = '';
  }

  private processBookFile(file: File): void {
    this.bookFileError = '';

    const extension =
      file.name.split('.').pop()?.toLowerCase();

    if (extension !== 'pdf') {
      this.bookFileError =
        'Only PDF files are allowed.';
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

    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp'
    ];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['png', 'jpg', 'jpeg', 'webp'];

    if (!validTypes.includes(file.type) && !validExts.includes(extension || '')) {
      this.coverError =
        'Only PNG, JPG, JPEG, and WebP images are allowed.';
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
