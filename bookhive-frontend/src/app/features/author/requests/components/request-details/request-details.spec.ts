import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  RequestDetailsComponent
} from './request-details';

describe(
  'RequestDetailsComponent',
  () => {

    let component: RequestDetailsComponent;
    let fixture:
      ComponentFixture<RequestDetailsComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          RequestDetailsComponent
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          RequestDetailsComponent
        );

      component = fixture.componentInstance;

      component.request = {
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

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should emit closed event', () => {
      let eventEmitted = false;

      component.closed.subscribe(() => {
        eventEmitted = true;
      });

      component.closeModal();

      expect(eventEmitted).toBe(true);
    });
  }
);
