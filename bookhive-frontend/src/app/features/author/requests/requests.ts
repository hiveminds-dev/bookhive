import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  RequestHeaderComponent
} from './components/request-header/request-header';

import {
  RequestFilterStatus,
  RequestFiltersComponent,
  RequestSortOption
} from './components/request-filters/request-filters';

import {
  RequestTableComponent
} from './components/request-table/request-table';

import {
  RequestDetailsComponent
} from './components/request-details/request-details';

import {
  AuthorBookRequest,
  RequestActionEvent
} from './components/request-row/request-row';

@Component({
  selector: 'app-author-requests',
  standalone: true,
  imports: [
    RequestHeaderComponent,
    RequestFiltersComponent,
    RequestTableComponent,
    RequestDetailsComponent
  ],
  templateUrl: './requests.html',
  styleUrl: './requests.scss'
})
export class RequestsComponent {

  private readonly router = inject(Router);

  selectedStatus: RequestFilterStatus = 'All';

  selectedSort: RequestSortOption = 'newest';

  currentPage = 1;

  readonly pageSize = 12;

  readonly totalDatabaseRequests = 24;

  selectedRequest: AuthorBookRequest | null = null;

  readonly requests: AuthorBookRequest[] = [
    {
      id: 1,
      title: 'Echoes of Silence',
      isbn: '978-3-16-148410-0',
      cover:
        'images/author-books/echoes-of-silence.jpg',
      submissionDate: 'Oct 24, 2023',
      status: 'Pending',
      adminFeedback:
        'Awaiting editorial board review.'
    },
    {
      id: 2,
      title: 'The Golden Hour',
      isbn: '978-1-56-123456-7',
      cover:
        'images/author-books/golden-hour.jpg',
      submissionDate: 'Oct 18, 2023',
      status: 'Approved',
      adminFeedback:
        'Excellent formatting and presentation.'
    },
    {
      id: 3,
      title: 'Binary Dreams',
      isbn: '978-0-12-345678-9',
      cover:
        'images/author-books/binary-dreams.jpg',
      submissionDate: 'Oct 12, 2023',
      status: 'Rejected',
      adminFeedback:
        'Cover resolution too low; please upload a higher-quality cover.'
    },
    {
      id: 4,
      title: 'The Arctic Path',
      isbn: '978-5-88-999000-1',
      cover:
        'images/author-books/arctic-path.jpg',
      submissionDate: 'Oct 10, 2023',
      status: 'Pending',
      adminFeedback:
        'In final editorial review.'
    }
  ];

  get filteredRequests(): AuthorBookRequest[] {
    let result = [...this.requests];

    if (this.selectedStatus !== 'All') {
      result = result.filter(
        request =>
          request.status === this.selectedStatus
      );
    }

    result.sort((firstRequest, secondRequest) => {
      if (this.selectedSort === 'title') {
        return firstRequest.title.localeCompare(
          secondRequest.title
        );
      }

      const firstDate = new Date(
        firstRequest.submissionDate
      ).getTime();

      const secondDate = new Date(
        secondRequest.submissionDate
      ).getTime();

      if (this.selectedSort === 'oldest') {
        return firstDate - secondDate;
      }

      return secondDate - firstDate;
    });

    return result;
  }

  get paginatedRequests(): AuthorBookRequest[] {
    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredRequests.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  get totalPages(): number {
    if (this.selectedStatus !== 'All') {
      return Math.max(
        1,
        Math.ceil(
          this.filteredRequests.length /
          this.pageSize
        )
      );
    }

    return Math.max(
      1,
      Math.ceil(
        this.totalDatabaseRequests /
        this.pageSize
      )
    );
  }

  get showingFrom(): number {
    if (this.filteredRequests.length === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;
  }

  get showingTo(): number {
    const total =
      this.selectedStatus === 'All'
        ? this.totalDatabaseRequests
        : this.filteredRequests.length;

    return Math.min(
      this.currentPage * this.pageSize,
      total
    );
  }

  get displayedTotalRequests(): number {
    return this.selectedStatus === 'All'
      ? this.totalDatabaseRequests
      : this.filteredRequests.length;
  }

  onStatusChanged(
    status: RequestFilterStatus
  ): void {
    this.selectedStatus = status;
    this.currentPage = 1;
  }

  onSortChanged(
    sort: RequestSortOption
  ): void {
    this.selectedSort = sort;
    this.currentPage = 1;
  }

  onPageChanged(page: number): void {
    this.currentPage = page;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  onRequestAction(
    event: RequestActionEvent
  ): void {
    if (event.action === 'details') {
      this.selectedRequest = event.request;
      return;
    }

    if (event.action === 'view') {
      this.router.navigate([
        '/explore',
        event.request.id,
        'preview'
      ]);

      return;
    }

    if (event.action === 'resubmit') {
      this.router.navigate([
        '/author/books/edit',
        event.request.id
      ]);
    }
  }

  closeRequestDetails(): void {
    this.selectedRequest = null;
  }
}
