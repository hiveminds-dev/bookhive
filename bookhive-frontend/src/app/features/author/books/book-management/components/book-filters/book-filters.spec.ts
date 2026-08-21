import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  BookFilterStatus,
  BookFiltersComponent
} from './book-filters';

describe('BookFiltersComponent', () => {
  let component: BookFiltersComponent;
  let fixture: ComponentFixture<BookFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookFiltersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      BookFiltersComponent
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with the All filter', () => {
    expect(component.selectedStatus).toBe('All');
  });

  it('should emit the selected status', () => {
    let selectedStatus:
      BookFilterStatus | undefined;

    component.statusChanged.subscribe(status => {
      selectedStatus = status;
    });

    component.selectStatus('Published');

    expect(component.selectedStatus)
      .toBe('Published');

    expect(selectedStatus)
      .toBe('Published');
  });

  it('should emit the search value', () => {
    let searchValue = '';

    component.searchChanged.subscribe(value => {
      searchValue = value;
    });

    component.searchTerm = 'Meditations';
    component.onSearchChange();

    expect(searchValue).toBe('Meditations');
  });

  it('should clear the search value', () => {
    component.searchTerm = 'The Ethical Arc';

    component.clearSearch();

    expect(component.searchTerm).toBe('');
  });
});
