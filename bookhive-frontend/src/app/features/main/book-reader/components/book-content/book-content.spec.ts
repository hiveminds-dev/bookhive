import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookContentComponent } from './book-content';

describe('BookContentComponent', () => {
  let component: BookContentComponent;
  let fixture: ComponentFixture<BookContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookContentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookContentComponent);
    component = fixture.componentInstance;

    component.chapterNumber = 4;
    component.chapterTitle = 'The Geometry of Dawn';
    component.paragraphs = [
      'In the quiet stillness of the early morning, light acts as a sculptor.',
      'To design for light is to design for time.'
    ];
    component.image = 'images/reader/chapter-light.jpg';
    component.zoomLevel = 100;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate the zoom scale', () => {
    component.zoomLevel = 125;

    expect(component.zoomScale).toBe(1.25);
  });

  it('should receive the chapter information', () => {
    expect(component.chapterNumber).toBe(4);
    expect(component.chapterTitle).toBe('The Geometry of Dawn');
    expect(component.paragraphs.length).toBe(2);
  });

  it('should activate the placeholder when image loading fails', () => {
    component.onImageError();

    expect(component.imageLoadFailed).toBe(true);
  });
});
