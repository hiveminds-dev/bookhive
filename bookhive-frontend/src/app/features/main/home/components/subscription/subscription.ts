import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCompass,
  LucideSparkles,
  LucideUserPlus,
} from '@lucide/angular';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    RouterLink,
    LucideSparkles,
    LucideUserPlus,
    LucideCompass,
  ],
  templateUrl: './subscription.html',
  styleUrl: './subscription.scss',
})
export class SubscriptionComponent {
  @Output() registerClick = new EventEmitter<void>();
  @Output() exploreClick = new EventEmitter<void>();

  onRegister(): void {
    this.registerClick.emit();
  }

  onExplore(): void {
    this.exploreClick.emit();
  }
}
