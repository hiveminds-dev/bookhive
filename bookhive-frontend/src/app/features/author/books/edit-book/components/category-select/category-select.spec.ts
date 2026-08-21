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

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain available categories', () => {
    expect(component.categories.length)
      .toBeGreaterThan(0);
  });

  it('should allow a category selection', () => {
    component.form
      .get('category')
      ?.setValue('Fiction');

    expect(
      component.form.get('category')?.value
    ).toBe('Fiction');
  });
});
