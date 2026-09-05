import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-community-cta',
  standalone: true,
  imports: [],
  templateUrl: './community-cta.html',
  styleUrl: './community-cta.scss'
})
export class CommunityCta {

  @Output()
  readonly joinCommunity =
    new EventEmitter<void>();

  @Output()
  readonly exploreBooks =
    new EventEmitter<void>();

  onJoinCommunity(): void {
    this.joinCommunity.emit();
  }

  onExploreBooks(): void {
    this.exploreBooks.emit();
  }
}
