import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

export type BookFilterStatus =
  'All' |
  'Published' |
  'Pending' |
  'Rejected' |
  'Draft';

@Component({
  selector: 'app-author-book-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './book-filters.html',
  styleUrl: './book-filters.scss'
})
export class BookFiltersComponent {

  @Output() statusChanged =
    new EventEmitter<BookFilterStatus>();

  @Output() searchChanged =
    new EventEmitter<string>();

  readonly statuses: BookFilterStatus[] = [
    'All',
    'Published',
    'Pending',
    'Rejected',
    'Draft'
  ];

  selectedStatus: BookFilterStatus = 'All';
  searchTerm = '';

  selectStatus(status: BookFilterStatus): void {
    this.selectedStatus = status;
    this.statusChanged.emit(status);
  }

  onSearchChange(): void {
    this.searchChanged.emit(
      this.searchTerm.trim()
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearchChange();
  }
}
