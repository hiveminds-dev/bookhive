import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-community-search',
  standalone: true,
  imports: [],
  templateUrl: './community-search.html',
  styleUrl: './community-search.scss'
})
export class CommunitySearch {

  searchTerm = '';

  @Output()
  readonly searchChanged =
    new EventEmitter<string>();

  onSearch(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    this.searchTerm =
      input.value;

    this.searchChanged.emit(
      this.searchTerm.trim()
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchChanged.emit('');
  }
}
