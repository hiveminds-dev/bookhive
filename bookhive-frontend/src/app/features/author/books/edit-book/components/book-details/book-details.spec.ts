import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  BookDetailsComponent
} from './book-details';

describe('BookDetailsComponent', () => {
  let component: BookDetailsComponent;
  let fixture: ComponentFixture<BookDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDetailsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      BookDetailsComponent
    );

    component = fixture.componentInstance;

    component.form = new FormGroup({
      language: new FormControl(
        'English',
        Validators.required
      ),
      readingLevel: new FormControl(
        'Beginner',
        Validators.required
      ),
      isbn: new FormControl(''),
      tags: new FormControl('')
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain available languages', () => {
    expect(component.languages.length)
      .toBeGreaterThan(0);
  });

  it('should contain reading levels', () => {
    expect(component.readingLevels)
      .toEqual([
        'Beginner',
        'Intermediate',
        'Advanced'
      ]);
  });

  it('should receive the default language', () => {
    expect(
      component.form.get('language')?.value
    ).toBe('English');
  });
});
