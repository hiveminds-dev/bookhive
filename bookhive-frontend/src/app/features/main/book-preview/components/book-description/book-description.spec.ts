import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookDescriptionComponent } from './book-description';

describe('BookDescriptionComponent', () => {
  let component: BookDescriptionComponent;
  let fixture: ComponentFixture<BookDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDescriptionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookDescriptionComponent);
    component = fixture.componentInstance;

    component.title = 'Abstract';
    component.paragraphs = [
      'This book explores the foundations of logic.',
      'It presents a clear framework for understanding complex ideas.'
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the section title', () => {
    expect(component.title).toBe('Abstract');
  });

  it('should receive description paragraphs', () => {
    expect(component.paragraphs.length).toBe(2);
  });
});
