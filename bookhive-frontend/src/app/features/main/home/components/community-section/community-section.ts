import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBookOpen,
  LucideMessageSquare,
  LucidePenLine,
  LucideUsers,
} from '@lucide/angular';

@Component({
  selector: 'app-community-section',
  standalone: true,
  imports: [
    RouterLink,
    LucideMessageSquare,
    LucideUsers,
    LucidePenLine,
    LucideBookOpen,
    LucideArrowRight,
  ],
  templateUrl: './community-section.html',
  styleUrl: './community-section.scss',
})
export class CommunitySectionComponent {
  @Output() joinCommunityClick = new EventEmitter<void>();

  onJoinCommunity(): void {
    this.joinCommunityClick.emit();
  }
}
