import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookHeaderComponent } from './book-header';

describe('BookHeaderComponent', () => {
  let component: BookHeaderComponent;
  let fixture: ComponentFixture<BookHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookHeaderComponent);
    component = fixture.componentInstance;

    component.category = 'Philosophy & Science';
    component.title = 'The Architecture of Logic';
    component.author = 'Jonathan Sterling';
    component.language = 'English';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the book information', () => {
    expect(component.title).toBe('The Architecture of Logic');
    expect(component.author).toBe('Jonathan Sterling');
    expect(component.category).toBe('Philosophy & Science');
    expect(component.language).toBe('English');
  });
});
