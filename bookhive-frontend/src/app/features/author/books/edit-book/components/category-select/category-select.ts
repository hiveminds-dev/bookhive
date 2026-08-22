import {
  Component,
  Input
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

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

  readonly categories = [
    'Fiction',
    'Mystery',
    'Thriller',
    'Romance',
    'Science Fiction',
    'Fantasy',
    'History',
    'Philosophy',
    'Business',
    'Technology',
    'Programming',
    'Design',
    'Personal Growth',
    'Biography',
    'Poetry',
    'Non-Fiction'
  ];

  hasRequiredError(): boolean {
    const category =
      this.form.get('category');

    return Boolean(
      category?.touched &&
      category.hasError('required')
    );
  }
}
