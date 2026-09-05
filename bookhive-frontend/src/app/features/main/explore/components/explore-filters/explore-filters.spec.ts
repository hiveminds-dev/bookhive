import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  ExploreFiltersComponent,
  ExploreFilterValues
} from './explore-filters';

describe('ExploreFiltersComponent', () => {
  let component: ExploreFiltersComponent;
  let fixture: ComponentFixture<ExploreFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreFiltersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use the default filter values', () => {
    expect(component.searchTerm).toBe('');
    expect(component.selectedLanguage).toBe('');
    expect(component.minimumRating).toBe(1);
    expect(component.categories[0].selected).toBe(false);
  });

  it('should emit the selected filters', () => {
    let emittedFilters: ExploreFilterValues | undefined;

    component.filtersChanged.subscribe(filters => {
      emittedFilters = filters;
    });

    component.searchTerm = 'Clean Code';
    component.selectedLanguage = 'English';
    component.minimumRating = 4;

    component.onFilterChange();

    expect(emittedFilters).toEqual({
      search: 'Clean Code',
      categories: [],
      language: 'English',
      minimumRating: 4
    });
  });

  it('should reset filters to their default values', () => {
    component.searchTerm = 'Angular';
    component.selectedLanguage = 'Sinhala';
    component.minimumRating = 2;
    component.categories[1].selected = true;

    component.resetFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedLanguage).toBe('');
    expect(component.minimumRating).toBe(1);
    expect(component.categories[0].selected).toBe(false);
    expect(component.categories[1].selected).toBe(false);
  });
});
