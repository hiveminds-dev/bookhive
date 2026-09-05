import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBookOpen,
  LucideCompass,
  LucideLayers,
  LucideSparkles,
} from '@lucide/angular';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    RouterLink,
    LucideSparkles,
    LucideCompass,
    LucideArrowRight,
    LucideBookOpen,
    LucideLayers,
  ],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class HeroComponent {
  @Output() exploreClick = new EventEmitter<void>();
  @Output() communityClick = new EventEmitter<void>();

  onExplore(): void {
    this.exploreClick.emit();
  }

  onCommunity(): void {
    this.communityClick.emit();
  }
}
