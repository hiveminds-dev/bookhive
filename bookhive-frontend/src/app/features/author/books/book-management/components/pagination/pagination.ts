import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

type PaginationItem = number | 'ellipsis';

@Component({
  selector: 'app-author-books-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss'
})
export class PaginationComponent {

  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Output() pageChanged =
    new EventEmitter<number>();

  get visiblePages(): PaginationItem[] {
    if (this.totalPages <= 5) {
      return Array.from(
        { length: this.totalPages },
        (_, index) => index + 1
      );
    }

    if (this.currentPage <= 3) {
      return [
        1,
        2,
        3,
        'ellipsis',
        this.totalPages
      ];
    }

    if (
      this.currentPage >=
      this.totalPages - 2
    ) {
      return [
        1,
        'ellipsis',
        this.totalPages - 2,
        this.totalPages - 1,
        this.totalPages
      ];
    }

    return [
      1,
      'ellipsis',
      this.currentPage,
      'ellipsis',
      this.totalPages
    ];
  }

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.pageChanged.emit(page);
  }

  previousPage(): void {
    this.changePage(this.currentPage - 1);
  }

  nextPage(): void {
    this.changePage(this.currentPage + 1);
  }

  isPageNumber(
    item: PaginationItem
  ): item is number {
    return typeof item === 'number';
  }
}
