import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  RelatedBook,
  RelatedBooksComponent
} from './related-books';

describe('RelatedBooksComponent', () => {
  let component: RelatedBooksComponent;
  let fixture: ComponentFixture<RelatedBooksComponent>;

  const testBook: RelatedBook = {
    id: 2,
    title: 'Structures of Reason',
    author: 'Maria Clarke',
    cover: 'images/books/structures-of-reason.jpg',
    rating: 4.7
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedBooksComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RelatedBooksComponent);
    component = fixture.componentInstance;
    component.books = [testBook];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive related books', () => {
    expect(component.books.length).toBe(1);
  });

  it('should emit the selected book', () => {
    let selectedBook: RelatedBook | undefined;

    component.bookSelected.subscribe(book => {
      selectedBook = book;
    });

    component.selectBook(testBook);

    expect(selectedBook).toEqual(testBook);
  });

  it('should record an image loading failure', () => {
    component.onImageError(testBook.id);

    expect(component.imageHasFailed(testBook.id)).toBe(true);
  });
});
