import {
  Component,
  EventEmitter,
  Output,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-biography-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './biography-form.html',
  styleUrl: './biography-form.scss'
})
export class BiographyForm {

  private readonly formBuilder =
    inject(FormBuilder);

  readonly maximumCharacters = 800;

  @Output()
  readonly biographyChanged =
    new EventEmitter<string>();

  readonly biographyForm =
    this.formBuilder.nonNullable.group({
      biography: [
        'Published author dedicated to compelling storytelling, insightful literature, and enriching the BookHive reading community with quality manuscripts.',
        [
          Validators.required,
          Validators.minLength(50),
          Validators.maxLength(
            this.maximumCharacters
          )
        ]
      ]
    });

  constructor() {
    this.biographyForm.controls.biography
      .valueChanges
      .subscribe(value => {
        if (
          this.biographyForm.controls
            .biography.valid
        ) {
          this.biographyChanged.emit(value);
        }
      });
  }

  get biography(): string {
    return this.biographyForm.controls
      .biography.value;
  }

  get characterCount(): number {
    return this.biography.length;
  }

  get isInvalid(): boolean {
    const control =
      this.biographyForm.controls.biography;

    return (
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }
}
