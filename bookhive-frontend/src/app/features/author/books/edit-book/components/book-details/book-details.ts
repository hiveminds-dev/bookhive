import {
  Component,
  Input
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-author-book-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './book-details.html',
  styleUrl: './book-details.scss'
})
export class BookDetailsComponent {

  @Input({ required: true })
  form!: FormGroup;

  readonly languages = [
    'English',
    'Sinhala',
    'Tamil',
    'French',
    'Spanish',
    'German',
    'Italian',
    'Japanese',
    'Korean',
    'Chinese'
  ];

  readonly readingLevels = [
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  hasError(
    controlName: string,
    errorName: string
  ): boolean {
    const control =
      this.form.get(controlName);

    return Boolean(
      control?.touched &&
      control.hasError(errorName)
    );
  }
}
