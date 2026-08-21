import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  AuthorBookRequest
} from '../request-row/request-row';

@Component({
  selector: 'app-author-request-details',
  standalone: true,
  imports: [],
  templateUrl: './request-details.html',
  styleUrl: './request-details.scss'
})
export class RequestDetailsComponent {

  @Input({ required: true })
  request!: AuthorBookRequest;

  @Output()
  readonly closed = new EventEmitter<void>();

  closeModal(): void {
    this.closed.emit();
  }

  onBackdropClick(
    event: MouseEvent
  ): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
