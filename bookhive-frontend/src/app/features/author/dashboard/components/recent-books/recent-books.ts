import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

export type AuthorBookStatus =
  'Published' | 'Pending' | 'Draft' | 'Rejected';

export interface RecentAuthorBook {
  id: number;
  title: string;
  cover: string;
  uploadedDate: string;
  status: AuthorBookStatus;
}

@Component({
  selector: 'app-recent-books',
  standalone: true,
  imports: [],
  templateUrl: './recent-books.html',
  styleUrl: './recent-books.scss'
})
export class RecentBooksComponent {

  @Input() books: RecentAuthorBook[] = [];

  @Output() viewAll = new EventEmitter<void>();
  @Output() bookSelected =
    new EventEmitter<RecentAuthorBook>();

  failedImageIds = new Set<number>();

  onViewAll(): void {
    this.viewAll.emit();
  }

  selectBook(book: RecentAuthorBook): void {
    this.bookSelected.emit(book);
  }

  onImageError(bookId: number): void {
    this.failedImageIds.add(bookId);
  }

  imageHasFailed(bookId: number): boolean {
    return this.failedImageIds.has(bookId);
  }

  getStatusClass(status: AuthorBookStatus): string {
    return status.toLowerCase();
  }
}
