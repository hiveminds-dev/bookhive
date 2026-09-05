import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookInfoComponent } from './book-info';

describe('BookInfoComponent', () => {
  let component: BookInfoComponent;
  let fixture: ComponentFixture<BookInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookInfoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookInfoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should receive the correct book information', () => {
    fixture.componentRef.setInput('rating', 4.8);
    fixture.componentRef.setInput('reviews', 342);
    fixture.componentRef.setInput('pages', 352);
    fixture.componentRef.setInput('readingTime', '7 hours');
    fixture.detectChanges();

    expect(component.rating).toBe(4.8);
    expect(component.reviews).toBe(342);
    expect(component.pages).toBe(352);
    expect(component.readingTime).toBe('7 hours');
  });

  it('should render Not available for pages when pages is null or 0', () => {
    fixture.componentRef.setInput('pages', null);
    fixture.componentRef.setInput('readingTime', null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Not available');
    expect(compiled.textContent).not.toContain('Reading time');
  });
});
