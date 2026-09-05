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

  readonly topViewedBooks: TopBook[] = [];

  readonly mostDownloadedBooks: TopBook[] = [];

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
