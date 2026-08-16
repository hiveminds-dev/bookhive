import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-navigation',
  standalone: true,
  imports: [],
  templateUrl: './page-navigation.html',
  styleUrl: './page-navigation.scss'
})
export class PageNavigationComponent {

  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() secondsRemaining = 30;

  get readingPercentage(): number {
    if (this.totalPages <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((this.currentPage / this.totalPages) * 100)
    );
  }

  get progressWidth(): string {
    return `${this.readingPercentage}%`;
  }
}
