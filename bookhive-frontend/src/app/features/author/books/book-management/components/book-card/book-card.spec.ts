import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  BookCardComponent,
  ManagedBook
} from './book-card';

describe('BookCardComponent', () => {
  let component: BookCardComponent;
  let fixture: ComponentFixture<BookCardComponent>;

  const testBook: ManagedBook = {
    id: 1,
    title: 'Meditations on Solitude',
    category: 'Philosophy',
    language: 'English',
    status: 'Published',
    cover: 'images/author-books/meditations.jpg',
    bannerImage:
      'images/author-books/meditations-banner.jpg',
    views: 1200,
    downloads: 800,
    uploadedDate: 'Oct 12, 2023'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      BookCardComponent
    );

    component = fixture.componentInstance;
    component.book = testBook;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format thousands', () => {
    expect(component.formatCount(1200)).toBe('1.2K');
  });

  it('should emit the view action', () => {
    let selectedBook: ManagedBook | undefined;

    component.viewBook.subscribe(book => {
      selectedBook = book;
    });

    component.onViewBook();

    expect(selectedBook).toEqual(testBook);
  });

  it('should emit the edit action', () => {
    let selectedBook: ManagedBook | undefined;

    component.editBook.subscribe(book => {
      selectedBook = book;
    });

    component.onEditBook();

    expect(selectedBook).toEqual(testBook);
  });

  it('should emit the delete action', () => {
    let selectedBook: ManagedBook | undefined;

    component.deleteBook.subscribe(book => {
      selectedBook = book;
    });

    component.onDeleteBook();

    expect(selectedBook).toEqual(testBook);
  });

  it('should activate the image fallback', () => {
    component.onImageError();

    expect(component.imageLoadFailed).toBe(true);
  });
});
