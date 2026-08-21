import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-profile-image-upload',
  standalone: true,
  imports: [],
  templateUrl: './profile-image-upload.html',
  styleUrl: './profile-image-upload.scss'
})
export class ProfileImageUpload {

  @Input()
  imageUrl =
    'images/author/profile/julian-barnes.jpg';

  @Output()
  readonly imageChanged =
    new EventEmitter<File>();

  isDragging = false;

  onFileSelected(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(
    event: DragEvent
  ): void {
    event.preventDefault();

    this.isDragging = true;
  }

  onDragLeave(
    event: DragEvent
  ): void {
    event.preventDefault();

    this.isDragging = false;
  }

  onFileDropped(
    event: DragEvent
  ): void {
    event.preventDefault();

    this.isDragging = false;

    const file =
      event.dataTransfer?.files[0];

    if (file) {
      this.processFile(file);
    }
  }

  private processFile(
    file: File
  ): void {
    if (!file.type.startsWith('image/')) {
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result === 'string'
      ) {
        this.imageUrl =
          reader.result;
      }
    };

    reader.readAsDataURL(file);

    this.imageChanged.emit(file);
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
