import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

export type BookRequestStatus =
  'Pending' |
  'Approved' |
  'Rejected';

export type RequestAction =
  'details' |
  'view' |
  'resubmit';

export interface AuthorBookRequest {
  id: number;
  title: string;
  isbn: string;
  cover: string;
  submissionDate: string;
  status: BookRequestStatus;
  adminFeedback: string;
}

export interface RequestActionEvent {
  action: RequestAction;
  request: AuthorBookRequest;
}

@Component({
  selector: 'app-author-request-row',
  standalone: true,
  imports: [],
  templateUrl: './request-row.html',
  styleUrl: './request-row.scss'
})
export class RequestRowComponent {

  @Input({ required: true })
  request!: AuthorBookRequest;

  @Output() actionSelected =
    new EventEmitter<RequestActionEvent>();

  imageLoadFailed = false;

  get statusClass(): string {
    return this.request.status.toLowerCase();
  }

  get actionLabel(): string {
    switch (this.request.status) {
      case 'Approved':
        return 'View Book';

      case 'Rejected':
        return 'Edit & Resubmit';

      case 'Pending':
      default:
        return 'View Details';
    }
  }

  get actionType(): RequestAction {
    switch (this.request.status) {
      case 'Approved':
        return 'view';

      case 'Rejected':
        return 'resubmit';

      case 'Pending':
      default:
        return 'details';
    }
  }

  onImageError(): void {
    this.imageLoadFailed = true;
  }

  onAction(): void {
    this.actionSelected.emit({
      action: this.actionType,
      request: this.request
    });
  }
}
