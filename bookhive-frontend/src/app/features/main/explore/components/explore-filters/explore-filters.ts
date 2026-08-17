import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ExploreFilterValues {
  search: string;
  categories: string[];
  language: string;
  minimumRating: number;
}

@Component({
  selector: 'app-explore-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './explore-filters.html',
  styleUrl: './explore-filters.scss'
})
export class ExploreFiltersComponent {

  @Output() filtersChanged = new EventEmitter<ExploreFilterValues>();

  searchTerm = '';
  selectedLanguage = '';
  minimumRating = 4;

  categories = [
    { name: 'Technology', selected: true },
    { name: 'Business', selected: false },
    { name: 'Programming', selected: false },
    { name: 'Design', selected: false },
    { name: 'Personal Growth', selected: false }
  ];

  languages = [
    'English',
    'Sinhala',
    'Tamil',
    'Spanish',
    'French'
  ];

  onFilterChange(): void {
    this.filtersChanged.emit({
      search: this.searchTerm.trim(),
      categories: this.categories
        .filter(category => category.selected)
        .map(category => category.name),
      language: this.selectedLanguage,
      minimumRating: this.minimumRating
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedLanguage = '';
    this.minimumRating = 4;

    this.categories = this.categories.map((category, index) => ({
      ...category,
      selected: index === 0
    }));

    this.onFilterChange();
  }
}
