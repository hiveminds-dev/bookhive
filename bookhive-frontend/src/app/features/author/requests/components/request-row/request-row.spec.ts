import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  AuthorBookRequest,
  RequestActionEvent,
  RequestRowComponent
} from './request-row';

describe('RequestRowComponent', () => {
  let component: RequestRowComponent;
  let fixture: ComponentFixture<RequestRowComponent>;

  const testRequest: AuthorBookRequest = {
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
      imports: [RequestRowComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      RequestRowComponent
    );

    component = fixture.componentInstance;
    component.request = testRequest;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use View Details for pending requests', () => {
    expect(component.actionLabel)
      .toBe('View Details');

    expect(component.actionType)
      .toBe('details');
  });

  it('should emit the selected action', () => {
    let emittedEvent:
      RequestActionEvent | undefined;

    component.actionSelected.subscribe(
      event => {
        emittedEvent = event;
      }
    );

    component.onAction();

    expect(emittedEvent?.action)
      .toBe('details');

    expect(emittedEvent?.request)
      .toEqual(testRequest);
  });

  it('should activate the cover fallback', () => {
    component.onImageError();

    expect(component.imageLoadFailed)
      .toBe(true);
  });
});
