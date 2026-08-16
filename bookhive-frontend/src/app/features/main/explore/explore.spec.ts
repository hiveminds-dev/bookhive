import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreComponent } from './explore';

describe('ExploreComponent', () => {
  let component: ExploreComponent;
  let fixture: ComponentFixture<ExploreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with grid view', () => {
    expect(component.viewMode).toBe('grid');
  });

  it('should contain three books', () => {
    expect(component.books.length).toBe(3);
  });

  it('should change to list view', () => {
    component.setViewMode('list');

    expect(component.viewMode).toBe('list');
  });

  it('should change back to grid view', () => {
    component.setViewMode('list');
    component.setViewMode('grid');

    expect(component.viewMode).toBe('grid');
  });

  it('should filter books using the search value', () => {
    component.onFiltersChanged({
      search: 'Quantum',
      categories: [],
      language: '',
      minimumRating: 1
    });

    expect(component.filteredBooks.length).toBe(1);
    expect(component.filteredBooks[0].title)
      .toBe('Quantum Leadership');
  });

  it('should filter books using a category', () => {
    component.onFiltersChanged({
      search: '',
      categories: ['Design'],
      language: '',
      minimumRating: 1
    });

    expect(component.filteredBooks.length).toBe(1);
    expect(component.filteredBooks[0].category)
      .toBe('Design');
  });

  it('should return no books for an unknown search', () => {
    component.onFiltersChanged({
      search: 'Unknown Book',
      categories: [],
      language: '',
      minimumRating: 1
    });

    expect(component.filteredBooks.length).toBe(0);
  });

  it('should reset the current page when filters change', () => {
    component.currentPage = 5;

    component.onFiltersChanged({
      search: '',
      categories: [],
      language: '',
      minimumRating: 1
    });

    expect(component.currentPage).toBe(1);
  });

  it('should sort books by title', () => {
    component.onFiltersChanged({
      search: '',
      categories: [],
      language: '',
      minimumRating: 1
    });
    component.sortOption = 'title';

    const sortedBooks = component.filteredBooks;

    expect(sortedBooks[0].title)
      .toBe('Quantum Leadership');
  });
});
