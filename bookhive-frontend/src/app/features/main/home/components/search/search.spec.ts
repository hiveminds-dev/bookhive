import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchComponent } from './search';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create SearchComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should emit trimmed query when onSubmit is called', () => {
    let emittedQuery = '';
    component.searchSubmitted.subscribe((q) => {
      emittedQuery = q;
    });

    component.query = '  Philosophy  ';
    component.onSubmit();

    expect(emittedQuery).toBe('Philosophy');
  });

  it('should not emit when query is empty or whitespace', () => {
    let emitted = false;
    component.searchSubmitted.subscribe(() => {
      emitted = true;
    });

    component.query = '   ';
    component.onSubmit();

    expect(emitted).toBe(false);
  });

  it('should emit tag value when onTagClick is called', () => {
    let emittedQuery = '';
    component.searchSubmitted.subscribe((q) => {
      emittedQuery = q;
    });

    component.onTagClick('Architecture');

    expect(component.query).toBe('Architecture');
    expect(emittedQuery).toBe('Architecture');
  });
});
