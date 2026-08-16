import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  Book,
  BookCardComponent
} from './book-card';

describe('BookCardComponent', () => {
  let component: BookCardComponent;
  let fixture: ComponentFixture<BookCardComponent>;

  const testBook: Book = {
    id: 1,
    title: 'The Architecture of Logic',
    author: 'Jonathan Sterling',
    category: 'Technology',
    language: 'English',
    rating: 4.9,
    reviews: 124,
    pages: 342,
    cover: 'images/explore/architecture-of-logic.jpg',
    description:
      'Explore the foundational structures of human thought.',
    badge: 'Premium'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookCardComponent);
    component = fixture.componentInstance;

    component.book = testBook;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the test book', () => {
    expect(component.book).toEqual(testBook);
  });

  it('should emit the book when Read Now is selected', () => {
    let emittedBook: Book | undefined;

    component.readBook.subscribe(book => {
      emittedBook = book;
    });

    component.onReadNow();

    expect(emittedBook).toEqual(testBook);
  });

  it('should emit the book when Preview is selected', () => {
    let emittedBook: Book | undefined;

    component.previewBook.subscribe(book => {
      emittedBook = book;
    });

    component.onPreview();

    expect(emittedBook).toEqual(testBook);
  });

  it('should activate the placeholder when the image fails', () => {
    component.onImageError();

    expect(component.imageLoadFailed).toBe(true);
  });
});
