import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-profile-save-actions',
  standalone: true,
  imports: [],
  templateUrl: './profile-save-actions.html',
  styleUrl: './profile-save-actions.scss'
})
export class ProfileSaveActions {

  @Input()
  isSaving = false;

  @Input()
  isSaveDisabled = false;

  @Output()
  readonly cancelSelected =
    new EventEmitter<void>();

  @Output()
  readonly saveSelected =
    new EventEmitter<void>();

  cancel(): void {
    if (this.isSaving) {
      return;
    }

    this.cancelSelected.emit();
  }

  save(): void {
    if (
      this.isSaving ||
      this.isSaveDisabled
    ) {
      return;
    }

    this.saveSelected.emit();
  }
}
