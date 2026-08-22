import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  BookManagementComponent
} from './book-management';

describe('BookManagementComponent', () => {
  let component: BookManagementComponent;
  let fixture: ComponentFixture<BookManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookManagementComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(
      BookManagementComponent
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain two books', () => {
    expect(component.books.length).toBe(2);
  });

  it('should filter published books', () => {
    component.onStatusChanged('Published');

    expect(component.filteredBooks.length)
      .toBe(1);

    expect(component.filteredBooks[0].status)
      .toBe('Published');
  });

  it('should filter books by title', () => {
    component.onSearchChanged('Ethical');

    expect(component.filteredBooks.length)
      .toBe(1);

    expect(component.filteredBooks[0].title)
      .toBe('The Ethical Arc');
  });

  it('should reset the page when filters change', () => {
    component.currentPage = 3;

    component.onStatusChanged('Draft');

    expect(component.currentPage).toBe(1);
  });
});
