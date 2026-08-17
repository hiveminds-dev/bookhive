import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { BookPreviewComponent } from './book-preview';

describe('BookPreviewComponent', () => {
  let component: BookPreviewComponent;
  let fixture: ComponentFixture<BookPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookPreviewComponent],

      providers: [
        provideRouter([]),

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (name: string) =>
                  name === 'id' ? '1' : null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read the book ID from the URL', () => {
    expect(component.bookId).toBe(1);
  });

  it('should contain the preview book information', () => {
    expect(component.book.title)
      .toBe('The Architecture of Logic');

    expect(component.book.author)
      .toBe('Jonathan Sterling');
  });

  it('should contain reader reviews', () => {
    expect(component.readerReviews.length).toBeGreaterThan(0);
  });

  it('should contain related books', () => {
    expect(component.relatedBooks.length).toBe(5);
  });
});
