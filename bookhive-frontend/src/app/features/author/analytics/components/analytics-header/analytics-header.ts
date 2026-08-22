import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-analytics-header',
  standalone: true,
  imports: [],
  templateUrl: './analytics-header.html',
  styleUrl: './analytics-header.scss'
})
export class AnalyticsHeaderComponent {

  @Output()
  readonly exportSelected =
    new EventEmitter<void>();

  exportReport(): void {
    this.exportSelected.emit();
  }
}
