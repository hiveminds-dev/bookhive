import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  language: string;
  rating: number;
  reviews: number;
  pages: number;
  cover: string;
  description: string;
  badge?: string;
}

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [],
  templateUrl: './book-card.html',
  styleUrl: './book-card.scss'
})
export class BookCardComponent {

  @Input({ required: true }) book!: Book;

  @Output() readBook = new EventEmitter<Book>();
  @Output() previewBook = new EventEmitter<Book>();

  imageLoadFailed = false;

  onReadNow(): void {
    this.readBook.emit(this.book);
  }

  onPreview(): void {
    this.previewBook.emit(this.book);
  }

  onImageError(): void {
    this.imageLoadFailed = true;
  }
}
