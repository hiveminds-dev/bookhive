import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ActivatedRoute,
  provideRouter
} from '@angular/router';
import { vi } from 'vitest';

import { BookReaderComponent } from './book-reader';

describe('BookReaderComponent', () => {
  let component: BookReaderComponent;
  let fixture: ComponentFixture<BookReaderComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [BookReaderComponent],

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

    fixture = TestBed.createComponent(BookReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.clearAllTimers();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read the book ID from the URL', () => {
    expect(component.bookId).toBe(1);
  });

  it('should move to the next page', () => {
    component.currentPage = 1;
    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  it('should move to the previous page', () => {
    component.currentPage = 5;
    component.previousPage();

    expect(component.currentPage).toBe(4);
  });

  it('should save reading progress', () => {
    component.changePage(25);
    vi.advanceTimersByTime(30_000);

    expect(
      localStorage.getItem(component.progressStorageKey)
    ).toBe('25');
  });

  it('should not move outside the valid page range', () => {
    component.changePage(150);

    expect(component.currentPage).toBe(1);
  });

  it('should increase zoom', () => {
    component.zoomLevel = 100;
    component.zoomIn();

    expect(component.zoomLevel).toBe(110);
  });
});
