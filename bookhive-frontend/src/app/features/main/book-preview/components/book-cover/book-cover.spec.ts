import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCoverComponent } from './book-cover';

describe('BookCoverComponent', () => {
  let component: BookCoverComponent;
  let fixture: ComponentFixture<BookCoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCoverComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookCoverComponent);
    component = fixture.componentInstance;

    component.title = 'The Architecture of Logic';
    component.cover = 'images/explore/architecture-of-logic.jpg';
    component.badge = 'Premium';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should activate the placeholder when image loading fails', () => {
    component.onImageError();

    expect(component.imageLoadFailed).toBe(true);
  });
});
