import {
  Component,
  Input
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-author-book-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss'
})
export class BookFormComponent {

  @Input({ required: true })
  form!: FormGroup;

  readonly maximumDescriptionLength = 500;

  get descriptionLength(): number {
    const description =
      this.form.get('description')?.value;

    return typeof description === 'string'
      ? description.length
      : 0;
  }

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
