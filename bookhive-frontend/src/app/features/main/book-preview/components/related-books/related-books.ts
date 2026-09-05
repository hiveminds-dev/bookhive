import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface RelatedBook {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
}

@Component({
  selector: 'app-related-books',
  standalone: true,
  imports: [],
  templateUrl: './related-books.html',
  styleUrl: './related-books.scss'
})
export class RelatedBooksComponent {

  @Input() books: RelatedBook[] = [];

  @Output() bookSelected = new EventEmitter<RelatedBook>();

  failedImageIds = new Set<number>();

  selectBook(book: RelatedBook): void {
    this.bookSelected.emit(book);
  }

  onImageError(bookId: number): void {
    this.failedImageIds.add(bookId);
  }

  imageHasFailed(bookId: number): boolean {
    return this.failedImageIds.has(bookId);
  }
}
