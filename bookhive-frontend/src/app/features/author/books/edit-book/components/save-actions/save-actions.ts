import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-author-save-actions',
  standalone: true,
  imports: [],
  templateUrl: './save-actions.html',
  styleUrl: './save-actions.scss'
})
export class SaveActionsComponent {

  @Input() isSavingDraft = false;
  @Input() isSubmitting = false;
  @Input() submitDisabled = false;

  @Output() saveDraft =
    new EventEmitter<void>();

  @Output() submitForReview =
    new EventEmitter<void>();

  onSaveDraft(): void {
    if (
      this.isSavingDraft ||
      this.isSubmitting
    ) {
      return;
    }

    this.saveDraft.emit();
  }

  onSubmitForReview(): void {
    if (
      this.submitDisabled ||
      this.isSavingDraft ||
      this.isSubmitting
    ) {
      return;
    }

    this.submitForReview.emit();
  }
}
