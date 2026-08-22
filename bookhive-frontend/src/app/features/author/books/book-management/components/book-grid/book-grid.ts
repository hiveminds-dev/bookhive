import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  BookCardComponent,
  ManagedBook
} from '../book-card/book-card';

@Component({
  selector: 'app-author-book-grid',
  standalone: true,
  imports: [BookCardComponent],
  templateUrl: './book-grid.html',
  styleUrl: './book-grid.scss'
})
export class BookGridComponent {

  @Input() books: ManagedBook[] = [];

  @Output() uploadBook =
    new EventEmitter<void>();

  @Output() viewBook =
    new EventEmitter<ManagedBook>();

  @Output() editBook =
    new EventEmitter<ManagedBook>();

  @Output() deleteBook =
    new EventEmitter<ManagedBook>();

  onUploadBook(): void {
    this.uploadBook.emit();
  }

  onViewBook(book: ManagedBook): void {
    this.viewBook.emit(book);
  }

  onEditBook(book: ManagedBook): void {
    this.editBook.emit(book);
  }

  onDeleteBook(book: ManagedBook): void {
    this.deleteBook.emit(book);
  }
}
