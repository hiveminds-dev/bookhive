import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-profile-actions',
  standalone: true,
  imports: [],
  templateUrl: './profile-actions.html',
  styleUrl: './profile-actions.scss'
})
export class ProfileActions {

  @Output()
  readonly editProfileSelected =
    new EventEmitter<void>();

  @Output()
  readonly changePasswordSelected =
    new EventEmitter<void>();

  editProfile(): void {
    this.editProfileSelected.emit();
  }

  changePassword(): void {
    this.changePasswordSelected.emit();
  }
}
