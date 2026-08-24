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
  });

  it('should create', () => {
    fixture.componentRef.setInput('book', testBook);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should receive the test book with full metadata', () => {
    fixture.componentRef.setInput('book', testBook);
    fixture.detectChanges();

    expect(component.book).toEqual(testBook);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('4.9');
    expect(compiled.textContent).toContain('(124)');
    expect(compiled.textContent).toContain('342 Pages');
  });

  it('should render Not rated and omit pages when metadata is missing', () => {
    const unratedBook: Book = {
      id: 2,
      title: 'Unrated Book',
      author: 'Unknown Author',
      category: 'General',
      language: 'English',
      cover: 'cover.jpg',
      description: 'A book without ratings.',
      rating: null,
      reviews: 0,
      pages: null,
    };
    fixture.componentRef.setInput('book', unratedBook);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Not rated');
    expect(compiled.textContent).not.toContain('Pages');
  });

  it('should emit the book when Read Now is selected', () => {
    fixture.componentRef.setInput('book', testBook);
    fixture.detectChanges();

    let emittedBook: Book | undefined;
    component.readBook.subscribe(book => {
      emittedBook = book;
    });

    component.onReadNow();

    expect(emittedBook).toEqual(testBook);
  });

  it('should emit the book when Preview is selected', () => {
    fixture.componentRef.setInput('book', testBook);
    fixture.detectChanges();

    let emittedBook: Book | undefined;
    component.previewBook.subscribe(book => {
      emittedBook = book;
    });

    component.onPreview();

    expect(emittedBook).toEqual(testBook);
  });

  it('should activate the placeholder when the image fails', () => {
    fixture.componentRef.setInput('book', testBook);
    fixture.detectChanges();

    component.onImageError();

    expect(component.imageLoadFailed).toBe(true);
  });
});
