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

export interface SocialLinksValue {
  website: string;
  twitter: string;
  linkedin: string;
}

@Component({
  selector: 'app-social-links-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './social-links-form.html',
  styleUrl: './social-links-form.scss'
})
export class SocialLinksForm {

  private readonly formBuilder =
    inject(FormBuilder);

  @Output()
  readonly socialLinksChanged =
    new EventEmitter<SocialLinksValue>();

  readonly urlPattern =
    /^https?:\/\/.+/i;

  readonly socialForm =
    this.formBuilder.nonNullable.group({
      website: [
        'https://example.com',
        [
          Validators.pattern(
            this.urlPattern
          )
        ]
      ],

      twitter: [
        'https://twitter.com',
        [
          Validators.pattern(
            this.urlPattern
          )
        ]
      ],

      linkedin: [
        'https://linkedin.com',
        [
          Validators.pattern(
            this.urlPattern
          )
        ]
      ]
    });

  constructor() {
    this.socialForm.valueChanges
      .subscribe(() => {
        this.emitSocialLinks();
      });
  }

  emitSocialLinks(): void {
    if (this.socialForm.invalid) {
      return;
    }

    this.socialLinksChanged.emit(
      this.socialForm.getRawValue()
    );
  }

  isInvalid(
    controlName:
    keyof SocialLinksValue
  ): boolean {
    const control =
      this.socialForm.controls[
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
