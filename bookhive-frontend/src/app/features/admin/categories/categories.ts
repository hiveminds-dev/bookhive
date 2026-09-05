import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AdminApiService } from '../../../core/services/admin-api.service';
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
  imports: [NgFor, NgIf, FormsModule, RouterLink, ConfirmationModalComponent],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApiService);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterStatus = signal('');
  filterMinBooks = signal<number | null>(null);

  readonly categoriesSignal = signal<CategoryItem[]>([]);
  readonly showAddModal = signal<boolean>(false);
  readonly deleteTargetCategory = signal<CategoryItem | null>(null);

  newCatName = '';
  newCatDesc = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.adminApi.getCategories().subscribe({
      next: (data) => {
        const mapped: CategoryItem[] = data.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description || 'No description provided.',
          totalBooks: c.total_books,
          isActive: c.is_active,
        }));
        this.categoriesSignal.set(mapped);
      },
      error: () => {
        this.categoriesSignal.set([]);
      }
    });
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  get filteredCategories(): CategoryItem[] {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.filterStatus();
    const minBooks = this.filterMinBooks();

    return this.categoriesSignal().filter(c => {
      const matchesQ = !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      if (!matchesQ) return false;

      if (status === 'active' && !c.isActive) return false;
      if (status === 'inactive' && c.isActive) return false;

      if (minBooks !== null && c.totalBooks < minBooks) return false;

      return true;
    });
  }

  applyFilters(): void {
    this.toastService.success('Filtered categories successfully.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterStatus.set('');
    this.filterMinBooks.set(null);
    this.toastService.info('Category search filters reset.', 'Filters Reset');
  }

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

    this.adminApi.createCategory({
      name: this.newCatName.trim(),
      description: this.newCatDesc.trim() || undefined,
    }).subscribe({
      next: (created) => {
        this.loadCategories();
        this.showAddModal.set(false);
        this.toastService.success(`Created category "${created.name}" successfully!`, 'Category Created');
      },
      error: (err) => {
        const errorMsg = err.error?.detail || 'Failed to create category.';
        this.toastService.error(errorMsg, 'Creation Failed');
      }
    });
  }

  toggleActive(cat: CategoryItem): void {
    this.adminApi.toggleCategoryStatus(cat.id).subscribe({
      next: (res) => {
        this.categoriesSignal.update(list =>
          list.map(c => (c.id === cat.id ? { ...c, isActive: res.is_active } : c))
        );
        const statusStr = res.is_active ? 'activated' : 'deactivated';
        this.toastService.info(`Category "${cat.name}" was ${statusStr}.`, 'Status Updated');
      },
      error: () => {
        this.toastService.error('Failed to update category status.', 'Update Error');
      }
    });
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
      this.adminApi.deleteCategory(cat.id).subscribe({
        next: () => {
          this.loadCategories();
          this.toastService.warning(`Permanently deleted category "${cat.name}".`, 'Category Deleted');
        },
        error: (err) => {
          const msg = err.error?.detail || 'Failed to delete category.';
          this.toastService.error(msg, 'Delete Error');
        }
      });
    }
    this.deleteTargetCategory.set(null);
  }
}
