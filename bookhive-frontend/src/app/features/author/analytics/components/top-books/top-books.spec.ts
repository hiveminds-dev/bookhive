import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  TopBooksComponent
} from './top-books';

describe(
  'TopBooksComponent',
  () => {

    let component: TopBooksComponent;

    let fixture:
      ComponentFixture<TopBooksComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          TopBooksComponent
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          TopBooksComponent
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain viewed books',
      () => {
        expect(
          component.topViewedBooks.length
        ).toBe(3);
      }
    );

    it(
      'should contain downloaded books',
      () => {
        expect(
          component.mostDownloadedBooks.length
        ).toBe(3);
      }
    );

    it(
      'should emit view all event',
      () => {
        let eventEmitted = false;

        component.viewAllSelected.subscribe(
          () => {
            eventEmitted = true;
          }
        );

        component.viewAllWorks();

        expect(eventEmitted).toBe(true);
      }
    );
  }
);
