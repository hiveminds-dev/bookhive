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
      'should contain three books',
      () => {
        expect(component.books.length)
          .toBe(3);
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

        component.openBook(
          component.books[0]
        );

        expect(selectedBookId).toBe(1);
      }
    );
  }
);
