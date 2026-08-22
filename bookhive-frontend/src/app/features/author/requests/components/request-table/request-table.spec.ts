import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  AuthorBookRequest
} from '../request-row/request-row';

import {
  RequestTableComponent
} from './request-table';

describe(
  'RequestTableComponent',
  () => {

    let component: RequestTableComponent;
    let fixture:
      ComponentFixture<RequestTableComponent>;

    const request: AuthorBookRequest = {
      id: 1,
      title: 'Echoes of Silence',
      isbn: '978-3-16-148410-0',
      cover:
        'images/author-books/echoes-of-silence.jpg',
      submissionDate: 'Oct 24, 2023',
      status: 'Pending',
      adminFeedback:
        'Awaiting editorial board review.'
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          RequestTableComponent
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          RequestTableComponent
        );

      component = fixture.componentInstance;

      component.requests = [request];
      component.currentPage = 1;
      component.totalPages = 3;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should create page numbers', () => {
      expect(component.visiblePages)
        .toEqual([1, 2, 3]);
    });

    it('should emit selected page', () => {
      let emittedPage: number | null = null;

      component.pageChanged.subscribe(
        page => {
          emittedPage = page;
        }
      );

      component.changePage(2);

      expect(emittedPage).toBe(2);
    });

    it(
      'should not emit the current page',
      () => {
        let eventEmitted = false;

        component.pageChanged.subscribe(
          () => {
            eventEmitted = true;
          }
        );

        component.changePage(1);

        expect(eventEmitted).toBe(false);
      }
    );
  }
);
