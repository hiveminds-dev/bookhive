import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-community-hero',
  standalone: true,
  imports: [],
  templateUrl: './community-hero.html',
  styleUrl: './community-hero.scss'
})
export class CommunityHero {

  @Output()
  readonly startDiscussion =
    new EventEmitter<void>();

  @Output()
  readonly browseCommunities =
    new EventEmitter<void>();

  onStartDiscussion(): void {
    this.startDiscussion.emit();
  }

  onBrowseCommunities(): void {
    this.browseCommunities.emit();
  }
}
