import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  FormControl,
  FormGroup
} from '@angular/forms';

import {
  BookFormComponent
} from './book-form';

describe('BookFormComponent', () => {
  let component: BookFormComponent;
  let fixture: ComponentFixture<BookFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      BookFormComponent
    );

    component = fixture.componentInstance;

    component.form = new FormGroup({
      title: new FormControl(''),
      authorName: new FormControl(''),
      description: new FormControl('')
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate the description length', () => {
    component.form
      .get('description')
      ?.setValue('Book description');

    expect(component.descriptionLength)
      .toBe(16);
  });

  it('should start with an empty description', () => {
    expect(component.descriptionLength)
      .toBe(0);
  });
});
