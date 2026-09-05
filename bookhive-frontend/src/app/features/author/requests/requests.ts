import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  BookService,
  AuthorBookItem
} from '../../../core/services/book.service';

import {
  ToastService
} from '../../../core/services/toast.service';

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
  BookRequestStatus,
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
export class RequestsComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly toastService = inject(ToastService);

  selectedStatus: RequestFilterStatus = 'All';
  selectedSort: RequestSortOption = 'newest';

  currentPage = 1;
  readonly pageSize = 12;
  isLoading = false;

  selectedRequest: AuthorBookRequest | null = null;
  requests: AuthorBookRequest[] = [];

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.bookService.getAuthorBooks().subscribe({
      next: (items) => {
        this.isLoading = false;
        // Filter out drafts from requests table if needed, or include them with status
        this.requests = items
          .filter((item) => item.status !== 'DRAFT')
          .map((item) => this.mapToAuthorBookRequest(item));
      },
      error: () => {
        this.isLoading = false;
        this.toastService.warning('Failed to load submission requests.', 'Notice');
      }
    });
  }

  private mapToAuthorBookRequest(item: AuthorBookItem): AuthorBookRequest {
    let status: BookRequestStatus = 'Pending';
    const s = item.status.toUpperCase();
    if (s === 'PUBLISHED') {
      status = 'Approved';
    } else if (s === 'REJECTED') {
      status = 'Rejected';
    } else {
      status = 'Pending';
    }

    const cover = item.cover_url || (item.cover_image_path ? `/${item.cover_image_path}` : 'images/author-books/default-cover.jpg');

    const dateField = item.submitted_at || item.created_at;
    const submissionDate = dateField
      ? new Date(dateField).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : '';

    let adminFeedback = 'Awaiting editorial board review.';
    if (status === 'Rejected') {
      adminFeedback = item.rejection_reason || 'Please review your book submission and update the required details.';
    } else if (status === 'Approved') {
      adminFeedback = 'Your book has been approved and published to the BookHive catalogue.';
    }

    return {
      id: item.id,
      title: item.title,
      isbn: item.category_name || 'General',
      cover,
      submissionDate,
      status,
      adminFeedback
    };
  }

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
    return Math.max(
      1,
      Math.ceil(
        this.filteredRequests.length /
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
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredRequests.length
    );
  }

  get displayedTotalRequests(): number {
    return this.filteredRequests.length;
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
