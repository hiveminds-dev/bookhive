import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideSearch, LucideTrendingUp } from '@lucide/angular';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, LucideSearch, LucideTrendingUp],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchComponent {
  @Output() searchSubmitted = new EventEmitter<string>();

  query = '';

  readonly trendingTags = [
    'Philosophy',
    'Technology',
    'Programming',
    'History',
    'Science',
    'Business',
  ];

  onSubmit(): void {
    const trimmed = this.query.trim();
    if (trimmed) {
      this.searchSubmitted.emit(trimmed);
    }
  }

  onTagClick(tag: string): void {
    this.query = tag;
    this.searchSubmitted.emit(tag);
  }
}
