import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ActivatedRoute,
  provideRouter
} from '@angular/router';

import {
  EditBookComponent
} from './edit-book';

describe('EditBookComponent', () => {
  let component: EditBookComponent;
  let fixture: ComponentFixture<EditBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBookComponent],

      providers: [
        provideRouter([]),

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(
      EditBookComponent
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in upload mode', () => {
    expect(component.isEditMode).toBe(false);
    expect(component.pageTitle)
      .toBe('Upload Books');
  });

  it('should start with the default language', () => {
    expect(
      component.bookForm.get('language')?.value
    ).toBe('English');
  });

  it('should require the title', () => {
    component.bookForm
      .get('title')
      ?.setValue('');

    expect(
      component.bookForm
        .get('title')
        ?.hasError('required')
    ).toBe(true);
  });
});
