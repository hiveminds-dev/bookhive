import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  AuthorBookRequest,
  RequestActionEvent,
  RequestRowComponent
} from '../request-row/request-row';

@Component({
  selector: 'app-author-request-table',
  standalone: true,
  imports: [
    RequestRowComponent
  ],
  templateUrl: './request-table.html',
  styleUrl: './request-table.scss'
})
export class RequestTableComponent {

  @Input() requests: AuthorBookRequest[] = [];

  @Input() currentPage = 1;

  @Input() totalPages = 1;

  @Output()
  readonly actionSelected =
    new EventEmitter<RequestActionEvent>();

  @Output()
  readonly pageChanged =
    new EventEmitter<number>();

  get visiblePages(): number[] {
    return Array.from(
      {
        length: Math.max(1, this.totalPages)
      },
      (_, index) => index + 1
    );
  }

  onRequestAction(
    event: RequestActionEvent
  ): void {
    this.actionSelected.emit(event);
  }

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.pageChanged.emit(page);
  }

  previousPage(): void {
    this.changePage(this.currentPage - 1);
  }

  nextPage(): void {
    this.changePage(this.currentPage + 1);
  }
}
