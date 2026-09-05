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
  CategorySelectComponent
} from './category-select';

describe('CategorySelectComponent', () => {
  let component: CategorySelectComponent;
  let fixture: ComponentFixture<CategorySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorySelectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      CategorySelectComponent
    );

    component = fixture.componentInstance;

    component.form = new FormGroup({
      category: new FormControl(
        '',
        Validators.required
      )
    });

    component.categories = [
      { id: 1, name: 'Fiction' },
      { id: 2, name: 'Mystery' }
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept and display categories', () => {
    expect(component.categories.length).toBe(2);
    expect(component.categories[0].name).toBe('Fiction');
  });

  it('should allow a category selection', () => {
    component.form
      .get('category')
      ?.setValue(1);

    expect(
      component.form.get('category')?.value
    ).toBe(1);
  });
});
