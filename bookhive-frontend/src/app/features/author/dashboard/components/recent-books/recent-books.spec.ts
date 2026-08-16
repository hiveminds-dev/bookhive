import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  RecentAuthorBook,
  RecentBooksComponent
} from './recent-books';

describe('RecentBooksComponent', () => {
  let component: RecentBooksComponent;
  let fixture: ComponentFixture<RecentBooksComponent>;

  const testBook: RecentAuthorBook = {
    id: 1,
    title: 'The Silent Anchor',
    cover: 'images/author-books/silent-anchor.jpg',
    uploadedDate: 'Oct 24, 2024',
    status: 'Published'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentBooksComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      RecentBooksComponent
    );

    component = fixture.componentInstance;
    component.books = [testBook];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive recent books', () => {
    expect(component.books.length).toBe(1);
  });

  it('should emit the selected book', () => {
    let selectedBook: RecentAuthorBook | undefined;

    component.bookSelected.subscribe(book => {
      selectedBook = book;
    });

    component.selectBook(testBook);

    expect(selectedBook).toEqual(testBook);
  });

  it('should record failed images', () => {
    component.onImageError(testBook.id);

    expect(component.imageHasFailed(testBook.id))
      .toBe(true);
  });
});
