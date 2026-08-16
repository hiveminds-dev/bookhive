import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reader-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reader-settings.html',
  styleUrl: './reader-settings.scss'
})
export class ReaderSettingsComponent implements OnChanges {

  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Output() shareExcerpt = new EventEmitter<void>();
  @Output() reportIssue = new EventEmitter<void>();
  @Output() pageSelected = new EventEmitter<number>();

  pageInput = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage']) {
      this.pageInput = this.currentPage;
    }
  }

  onShareExcerpt(): void {
    this.shareExcerpt.emit();
  }

  onReportIssue(): void {
    this.reportIssue.emit();
  }

  goToPage(): void {
    const page = Number(this.pageInput);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > this.totalPages
    ) {
      this.pageInput = this.currentPage;
      return;
    }

    this.pageSelected.emit(page);
  }
}
