import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

export type ManagedBookStatus =
  'Published' |
  'Pending' |
  'Rejected' |
  'Draft';

export interface ManagedBook {
  id: number;
  title: string;
  category: string;
  language: string;
  status: ManagedBookStatus;
  cover: string;
  bannerImage?: string;
  views: number;
  downloads: number;
  uploadedDate: string;
  rejectionReason?: string | null;
}

@Component({
  selector: 'app-author-book-card',
  standalone: true,
  imports: [],
  templateUrl: './book-card.html',
  styleUrl: './book-card.scss'
})
export class BookCardComponent {

  @Input({ required: true })
  book!: ManagedBook;

  @Output() viewBook =
    new EventEmitter<ManagedBook>();

  @Output() editBook =
    new EventEmitter<ManagedBook>();

  @Output() deleteBook =
    new EventEmitter<ManagedBook>();

  imageLoadFailed = false;

  onImageError(): void {
    this.imageLoadFailed = true;
  }

  onViewBook(): void {
    this.viewBook.emit(this.book);
  }

  onEditBook(): void {
    this.editBook.emit(this.book);
  }

  onDeleteBook(): void {
    this.deleteBook.emit(this.book);
  }

  formatCount(value: number): string {
    if (value >= 1000) {
      const formatted = value / 1000;

      return Number.isInteger(formatted)
        ? `${formatted}K`
        : `${formatted.toFixed(1)}K`;
    }

    return String(value);
  }

  get statusClass(): string {
    return this.book.status.toLowerCase();
  }
}
