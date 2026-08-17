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

    component.rating = 4.8;
    component.reviews = 342;
    component.pages = 352;
    component.readingTime = '7 hours';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the correct book information', () => {
    expect(component.rating).toBe(4.8);
    expect(component.reviews).toBe(342);
    expect(component.pages).toBe(352);
    expect(component.readingTime).toBe('7 hours');
  });
});
