import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

export type RequestFilterStatus =
  'All' |
  'Pending' |
  'Approved' |
  'Rejected';

export type RequestSortOption =
  'newest' |
  'oldest' |
  'title';

@Component({
  selector: 'app-author-request-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './request-filters.html',
  styleUrl: './request-filters.scss'
})
export class RequestFiltersComponent {

  @Input() showingFrom = 1;
  @Input() showingTo = 12;
  @Input() totalRequests = 0;

  @Output() statusChanged =
    new EventEmitter<RequestFilterStatus>();

  @Output() sortChanged =
    new EventEmitter<RequestSortOption>();

  readonly statuses: RequestFilterStatus[] = [
    'All',
    'Pending',
    'Approved',
    'Rejected'
  ];

  selectedStatus: RequestFilterStatus = 'All';
  selectedSort: RequestSortOption = 'newest';

  selectStatus(
    status: RequestFilterStatus
  ): void {
    this.selectedStatus = status;
    this.statusChanged.emit(status);
  }

  onSortChanged(): void {
    this.sortChanged.emit(
      this.selectedSort
    );
  }
}
