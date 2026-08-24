import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowRight,
  LucideAtom,
  LucideBookOpen,
  LucideBriefcase,
  LucideCode,
  LucideCpu,
  LucideFolder,
  LucideHistory,
  LucidePalette,
  LucideRotateCw,
  LucideSparkles,
} from '@lucide/angular';
import { CategoryItem } from '../../../../../core/services/book.service';

export type CategoryIconType = 'code' | 'cpu' | 'atom' | 'briefcase' | 'palette' | 'history' | 'sparkles' | 'book';

export interface CategoryCardDisplay {
  id: number;
  name: string;
  description: string;
  iconType: CategoryIconType;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    RouterLink,
    LucideArrowRight,
    LucideAlertCircle,
    LucideRotateCw,
    LucideFolder,
    LucideCode,
    LucideCpu,
    LucideAtom,
    LucideBriefcase,
    LucidePalette,
    LucideHistory,
    LucideSparkles,
    LucideBookOpen,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesComponent {
  @Input() categories: CategoryItem[] = [];
  @Input() isLoading = false;
  @Input() hasError = false;

  @Output() categorySelected = new EventEmitter<number>();
  @Output() retryClick = new EventEmitter<void>();

  readonly skeletonCount = [1, 2, 3, 4, 5, 6];

  get displayCategories(): CategoryCardDisplay[] {
    if (!this.categories || this.categories.length === 0) {
      return [];
    }

    return this.categories
      .filter((cat) => cat.is_active !== false)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || `Explore verified manuscripts in ${cat.name}.`,
        iconType: this.getIconType(cat.name),
      }));
  }

  private getIconType(name: string): CategoryIconType {
    const lower = name.toLowerCase();
    if (lower.includes('program') || lower.includes('software')) return 'code';
    if (lower.includes('tech') || lower.includes('computer')) return 'cpu';
    if (lower.includes('science') || lower.includes('physics')) return 'atom';
    if (lower.includes('business') || lower.includes('econom')) return 'briefcase';
    if (lower.includes('art') || lower.includes('design')) return 'palette';
    if (lower.includes('history') || lower.includes('society')) return 'history';
    if (lower.includes('growth') || lower.includes('fiction') || lower.includes('novel')) return 'sparkles';
    return 'book';
  }

  onRetry(): void {
    this.retryClick.emit();
  }
}
