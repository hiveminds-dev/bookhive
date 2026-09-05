import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface CategoryOption {
  id?: number;
  name: string;
  selected: boolean;
}

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

  @Input()
  set search(value: string) {
    if (value !== this.searchTerm) {
      this.searchTerm = value || '';
    }
  }

  @Input()
  set initialCategories(cats: { id?: number; name: string }[]) {
    if (cats && cats.length > 0) {
      this.categories = cats.map((c) => ({
        id: c.id,
        name: c.name,
        selected: false
      }));
    }
  }

  searchTerm = '';
  selectedLanguage = '';
  minimumRating = 1;

  categories: CategoryOption[] = [
    { name: 'Technology', selected: false },
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
    this.minimumRating = 1;

    this.categories = this.categories.map((category) => ({
      ...category,
      selected: false
    }));

    this.onFilterChange();
  }
}
