import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

export interface AuthorProfileBook {
  id: number;
  title: string;
  category: string;
  cover: string;
  publishedDate: string;
  rating: number;
}

@Component({
  selector: 'app-profile-books',
  standalone: true,
  imports: [],
  templateUrl: './profile-books.html',
  styleUrl: './profile-books.scss'
})
export class ProfileBooks {

  @Output()
  readonly bookSelected =
    new EventEmitter<AuthorProfileBook>();

  @Output()
  readonly viewAllSelected =
    new EventEmitter<void>();

  readonly books: AuthorProfileBook[] = [];

  openBook(
    book: AuthorProfileBook
  ): void {
    this.bookSelected.emit(book);
  }

  viewAllBooks(): void {
    this.viewAllSelected.emit();
  }

  handleImageError(
    event: Event
  ): void {
    const image =
      event.target as HTMLImageElement;

    image.src =
      'images/author-books/book-placeholder.jpg';
  }
}
