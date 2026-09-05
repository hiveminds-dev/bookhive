import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ManagedBook
} from '../book-card/book-card';

import {
  BookGridComponent
} from './book-grid';

describe('BookGridComponent', () => {
  let component: BookGridComponent;
  let fixture: ComponentFixture<BookGridComponent>;

  const testBook: ManagedBook = {
    id: 1,
    title: 'Meditations on Solitude',
    category: 'Philosophy',
    language: 'English',
    status: 'Published',
    cover: 'images/author-books/meditations.jpg',
    views: 1200,
    downloads: 800,
    uploadedDate: 'Oct 12, 2023'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookGridComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      BookGridComponent
    );

    component = fixture.componentInstance;
    component.books = [testBook];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive books', () => {
    expect(component.books.length).toBe(1);
  });

  it('should emit the upload action', () => {
    let emitted = false;

    component.uploadBook.subscribe(() => {
      emitted = true;
    });

    component.onUploadBook();

    expect(emitted).toBe(true);
  });

  it('should emit the selected book', () => {
    let selectedBook: ManagedBook | undefined;

    component.viewBook.subscribe(book => {
      selectedBook = book;
    });

    component.onViewBook(testBook);

    expect(selectedBook).toEqual(testBook);
  });
});
