import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  CommunitySearch
} from './community-search';

describe('CommunitySearch', () => {

  let component: CommunitySearch;

  let fixture:
    ComponentFixture<CommunitySearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommunitySearch
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        CommunitySearch
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should update and emit the search value',
    () => {
      let emittedValue = '';

      component.searchChanged
        .subscribe(value => {
          emittedValue = value;
        });

      const input:
        HTMLInputElement =
        fixture.nativeElement.querySelector(
          'input'
        );

      input.value = 'Angular books';

      input.dispatchEvent(
        new Event('input')
      );

      expect(
        component.searchTerm
      ).toBe('Angular books');

      expect(
        emittedValue
      ).toBe('Angular books');
    }
  );

  it(
    'should trim emitted search text',
    () => {
      let emittedValue = '';

      component.searchChanged
        .subscribe(value => {
          emittedValue = value;
        });

      const input:
        HTMLInputElement =
        fixture.nativeElement.querySelector(
          'input'
        );

      input.value = '  Fiction  ';

      input.dispatchEvent(
        new Event('input')
      );

      expect(
        emittedValue
      ).toBe('Fiction');
    }
  );

  it(
    'should clear the search',
    () => {
      let emittedValue = 'previous';

      component.searchTerm = 'BookHive';

      component.searchChanged
        .subscribe(value => {
          emittedValue = value;
        });

      component.clearSearch();

      expect(
        component.searchTerm
      ).toBe('');

      expect(
        emittedValue
      ).toBe('');
    }
  );
});
