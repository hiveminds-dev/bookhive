import {
  Component,
  Input
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

export interface CategoryOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-author-category-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './category-select.html',
  styleUrl: './category-select.scss'
})
export class CategorySelectComponent {

  @Input({ required: true })
  form!: FormGroup;

  @Input()
  categories: CategoryOption[] = [];

  hasRequiredError(): boolean {
    const category =
      this.form.get('category');

    return Boolean(
      category?.touched &&
      category.hasError('required')
    );
  }
}
