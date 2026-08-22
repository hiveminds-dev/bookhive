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

export interface PersonalDetailsValue {
  fullName: string;
  penName: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  category: string;
}

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './personal-details.html',
  styleUrl: './personal-details.scss'
})
export class PersonalDetails {

  private readonly formBuilder =
    inject(FormBuilder);

  @Output()
  readonly detailsChanged =
    new EventEmitter<PersonalDetailsValue>();

  readonly countries = [
    'United Kingdom',
    'United States',
    'Canada',
    'Australia',
    'Sri Lanka',
    'India'
  ];

  readonly languages = [
    'English (UK)',
    'English (US)',
    'Sinhala',
    'Tamil',
    'French',
    'Spanish'
  ];

  readonly categories = [
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'History',
    'Poetry',
    'Philosophy',
    'Science Fiction'
  ];

  readonly detailsForm =
    this.formBuilder.nonNullable.group({
      fullName: [
        'Julian Barnes',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      penName: [
        'J.B. Aurelius',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      email: [
        'j.barnes@aurelius.com',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phone: [
        '+44 20 7946 0958',
        [
          Validators.required,
          Validators.minLength(7)
        ]
      ],

      country: [
        'United Kingdom',
        Validators.required
      ],

      language: [
        'English (UK)',
        Validators.required
      ],

      category: [
        'Fiction',
        Validators.required
      ]
    });

  constructor() {
    this.detailsForm.valueChanges
      .subscribe(() => {
        this.emitDetails();
      });
  }

  emitDetails(): void {
    if (this.detailsForm.invalid) {
      return;
    }

    this.detailsChanged.emit(
      this.detailsForm.getRawValue()
    );
  }

  isInvalid(
    controlName:
    keyof PersonalDetailsValue
  ): boolean {
    const control =
      this.detailsForm.controls[
        controlName
        ];

    return (
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }
}
