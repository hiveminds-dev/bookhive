import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal';

interface CategoryItem {
  id: number;
  name: string;
  description: string;
  totalBooks: number;
  isActive: boolean;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ConfirmationModalComponent],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesComponent {
  private readonly toastService = inject(ToastService);

  readonly categoriesSignal = signal<CategoryItem[]>([
    { id: 1, name: 'Philosophy & Logic', description: 'Classical and modern philosophical texts and logic frameworks.', totalBooks: 142, isActive: true },
    { id: 2, name: 'Science & Physics', description: 'Quantum mechanics, physics, biology, and natural sciences.', totalBooks: 98, isActive: true },
    { id: 3, name: 'Fiction & Novels', description: 'Literary fiction, mystery, sci-fi, and narrative works.', totalBooks: 215, isActive: true },
    { id: 4, name: 'History & Society', description: 'World history, anthropology, and social studies.', totalBooks: 76, isActive: true },
    { id: 5, name: 'Art & Design', description: 'Visual design, architecture, typography, and aesthetics.', totalBooks: 54, isActive: false },
  ]);

  readonly showAddModal = signal<boolean>(false);
  readonly deleteTargetCategory = signal<CategoryItem | null>(null);

  newCatName = '';
  newCatDesc = '';

  openAddCategoryModal(): void {
    this.newCatName = '';
    this.newCatDesc = '';
    this.showAddModal.set(true);
  }

  closeAddCategoryModal(): void {
    this.showAddModal.set(false);
  }

  saveCategory(): void {
    if (!this.newCatName.trim()) {
      this.toastService.error('Category name is required.', 'Validation Error');
      return;
    }

    const newId = this.categoriesSignal().length + 1;
    const item: CategoryItem = {
      id: newId,
      name: this.newCatName.trim(),
      description: this.newCatDesc.trim() || 'No description provided.',
      totalBooks: 0,
      isActive: true,
    };

    this.categoriesSignal.update((list) => [item, ...list]);
    this.showAddModal.set(false);
    this.toastService.success(`Created category "${item.name}" successfully!`, 'Category Created');
  }

  toggleActive(cat: CategoryItem): void {
    cat.isActive = !cat.isActive;
    const statusStr = cat.isActive ? 'activated' : 'deactivated';
    this.toastService.info(`Category "${cat.name}" was ${statusStr}.`, 'Status Updated');
  }

  promptDelete(cat: CategoryItem): void {
    this.deleteTargetCategory.set(cat);
  }

  cancelDelete(): void {
    this.deleteTargetCategory.set(null);
  }

  confirmDelete(): void {
    const cat = this.deleteTargetCategory();
    if (cat) {
      this.categoriesSignal.update((list) => list.filter((c) => c.id !== cat.id));
      this.toastService.warning(`Permanently deleted category "${cat.name}".`, 'Category Deleted');
    }
    this.deleteTargetCategory.set(null);
  }
}
