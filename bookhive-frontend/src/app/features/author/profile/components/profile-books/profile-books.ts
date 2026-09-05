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

  readonly books: AuthorProfileBook[] = [
    {
      id: 1,
      title: 'Meditations on Solitude',
      category: 'Philosophy',
      cover:
        'images/author-books/meditations.jpg',
      publishedDate: 'Oct 12, 2023',
      rating: 4.9
    },
    {
      id: 2,
      title: 'The Gilded Key',
      category: 'Mystery',
      cover:
        'images/author-books/gilded-key.jpg',
      publishedDate: 'Aug 18, 2023',
      rating: 4.8
    },
    {
      id: 3,
      title: 'Echoes of Rome',
      category: 'History',
      cover:
        'images/author-books/echoes-of-rome.jpg',
      publishedDate: 'Jun 05, 2023',
      rating: 4.7
    }
  ];

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
