import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ProfileBooks
} from './profile-books';

describe(
  'ProfileBooks',
  () => {

    let component: ProfileBooks;

    let fixture:
      ComponentFixture<ProfileBooks>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ProfileBooks
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          ProfileBooks
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should start without placeholder books',
      () => {
        expect(component.books.length)
          .toBe(0);
      }
    );

    it(
      'should emit selected book',
      () => {
        let selectedBookId:
          number | null = null;

        component.bookSelected.subscribe(
          book => {
            selectedBookId = book.id;
          }
        );

        component.books = [
          {
            id: 1,
            title: 'Mind Over Marathon',
            category: 'Personal Growth',
            cover: 'images/author-books/mind-over-marathon.jpg',
            publishedDate: 'Sep 4, 2026',
            rating: 4.5
          }
        ];

        component.openBook(component.books[0]);

        expect(selectedBookId).toBe(1);
      }
    );
  }
);
