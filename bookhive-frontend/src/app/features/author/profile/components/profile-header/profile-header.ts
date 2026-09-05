import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [],
  templateUrl: './profile-header.html',
  styleUrl: './profile-header.scss'
})
export class ProfileHeader {

  @Input()
  authorName = 'Author';

  @Input()
  penName = 'Author Profile';

  @Input()
  profileImage =
    'images/author/profile/profile-placeholder.jpg';

  @Input()
  badges: string[] = [
    'Author',
    'Active'
  ];

  @Output()
  readonly profileImageChanged =
    new EventEmitter<File>();

  onImageSelected(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.profileImageChanged.emit(file);
  }

  handleImageError(
    event: Event
  ): void {
    const image =
      event.target as HTMLImageElement;

    image.src =
      'images/author/profile/profile-placeholder.jpg';
  }
}
