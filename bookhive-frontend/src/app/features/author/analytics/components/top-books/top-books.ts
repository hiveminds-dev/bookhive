import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

export interface TopBook {
  id: number;
  title: string;
  category: string;
  cover: string;
  amount: string;
}

@Component({
  selector: 'app-top-books',
  standalone: true,
  imports: [],
  templateUrl: './top-books.html',
  styleUrl: './top-books.scss'
})
export class TopBooksComponent {

  @Output()
  readonly viewAllSelected =
    new EventEmitter<void>();

  @Output()
  readonly downloadReportSelected =
    new EventEmitter<void>();

  readonly topViewedBooks: TopBook[] = [
    {
      id: 1,
      title: 'The Gilded Key',
      category: 'Mystery',
      cover:
        'images/author-books/gilded-key.jpg',
      amount: '24.1K Views'
    },
    {
      id: 2,
      title: 'Stellar Silence',
      category: 'Sci-Fi',
      cover:
        'images/author-books/stellar-silence.jpg',
      amount: '18.5K Views'
    },
    {
      id: 3,
      title: 'Echoes of Rome',
      category: 'History',
      cover:
        'images/author-books/echoes-of-rome.jpg',
      amount: '12.9K Views'
    }
  ];

  readonly mostDownloadedBooks: TopBook[] = [
    {
      id: 4,
      title: 'Creative Flow',
      category: 'Non-Fiction',
      cover:
        'images/author-books/creative-flow.jpg',
      amount: '9.4K DLs'
    },
    {
      id: 5,
      title: 'Midnight Protocol',
      category: 'Thriller',
      cover:
        'images/author-books/midnight-protocol.jpg',
      amount: '7.2K DLs'
    },
    {
      id: 6,
      title: 'Whispers in Gold',
      category: 'Poetry',
      cover:
        'images/author-books/whispers-in-gold.jpg',
      amount: '6.8K DLs'
    }
  ];

  viewAllWorks(): void {
    this.viewAllSelected.emit();
  }

  downloadReports(): void {
    this.downloadReportSelected.emit();
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
