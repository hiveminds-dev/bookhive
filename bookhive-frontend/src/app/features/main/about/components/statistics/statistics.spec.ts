import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  of
} from 'rxjs';

import {
  BookService
} from '../../../../../core/services/book.service';
import {
  Statistics
} from './statistics';

describe(
  'Statistics',
  () => {

    let component: Statistics;

    let fixture:
      ComponentFixture<Statistics>;

    const bookServiceMock = {
      getCatalogueStatistics: vi.fn().mockReturnValue(of({
        total_books: 20,
        total_authors: 13,
        total_readers: 10,
        total_downloads: 42,
      })),
    };

    beforeEach(async () => {
      bookServiceMock.getCatalogueStatistics.mockClear();
      bookServiceMock.getCatalogueStatistics.mockReturnValue(of({
        total_books: 20,
        total_authors: 13,
        total_readers: 10,
        total_downloads: 42,
      }));

      await TestBed.configureTestingModule({
        imports: [
          Statistics
        ],
        providers: [
          {
            provide: BookService,
            useValue: bookServiceMock
          }
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          Statistics
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain four statistics',
      () => {
        expect(component.statistics.length)
          .toBe(4);
      }
    );

    it(
      'should contain total books',
      () => {
        expect(
          component.statistics[0].value
        ).toBe('20');
      }
    );

    it(
      'should load statistics from the public catalogue API',
      () => {
        expect(bookServiceMock.getCatalogueStatistics)
          .toHaveBeenCalledOnce();
        expect(component.statistics)
          .toEqual([
            {
              id: 1,
              value: '20',
              label: 'Books'
            },
            {
              id: 2,
              value: '13',
              label: 'Authors'
            },
            {
              id: 3,
              value: '10',
              label: 'Readers'
            },
            {
              id: 4,
              value: '42',
              label: 'Downloads'
            }
          ]);
      }
    );
  }
);
