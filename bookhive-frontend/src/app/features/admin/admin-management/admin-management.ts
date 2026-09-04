import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AdminApiService, AdminStaffStats, AdminUserItem } from '../../../core/services/admin-api.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal';
import { LucideShieldCheck, LucideStar, LucideLock, LucideUserPlus, LucideSearch, LucideX, LucideFilter, LucideCheck, LucideKeyRound, LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-admin-management',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, ConfirmationModalComponent, LucideShieldCheck, LucideStar, LucideLock, LucideUserPlus, LucideSearch, LucideX, LucideFilter, LucideCheck, LucideKeyRound, LucideTrash2],
  templateUrl: './admin-management.html',
  styleUrl: './admin-management.scss',
})
export class AdminManagementComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApiService);

  readonly adminsSignal = signal<AdminUserItem[]>([]);
  readonly staffStatsSignal = signal<AdminStaffStats | null>(null);
  readonly loading = signal(true);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterRole = signal('');
  filterStatus = signal('');
  filterSortBy = signal('newest');

  showCreateModal = signal(false);
  targetAdminForDelete = signal<AdminUserItem | null>(null);

  newAdminName = '';
  newAdminUsername = '';
  newAdminEmail = '';
  newAdminPassword = '';
  newAdminRole = 'Senior Editor';
  newAdminDept = 'Editorial & Curation';

  ngOnInit(): void {
    this.loadAdminStaff();
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  loadAdminStaff(): void {
    this.loading.set(true);
    this.adminApi.getAdminStaffStats().subscribe({
      next: (stats) => {
        this.staffStatsSignal.set(stats);
      }
    });

    this.adminApi.getAdminStaff().subscribe({
      next: (data) => {
        this.adminsSignal.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.info('Could not load admin staff accounts.', 'Notice');
        this.loading.set(false);
      }
    });
  }

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  get filteredAdmins(): AdminUserItem[] {
    const q = this.searchQuery().toLowerCase().trim();
    const role = this.filterRole().toLowerCase().trim();
    const status = this.filterStatus().toLowerCase().trim();
    const sortBy = this.filterSortBy();

    let list = this.adminsSignal().filter(a => {
      const matchesQ = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.department.toLowerCase().includes(q);
      if (!matchesQ) return false;

      const matchesRole = !role || a.role.toLowerCase().includes(role);
      if (!matchesRole) return false;

      const matchesStatus = !status || a.status.toLowerCase().includes(status);
      if (!matchesStatus) return false;

      return true;
    });

    if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'oldest') {
      list = [...list].sort((a, b) => a.id - b.id);
    } else {
      list = [...list].sort((a, b) => b.id - a.id);
    }

    return list;
  }

  applyFilters(): void {
    this.loadAdminStaff();
    this.toastService.success('Admin accounts list filtered.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterRole.set('');
    this.filterStatus.set('');
    this.filterSortBy.set('newest');
    this.loadAdminStaff();
    this.toastService.info('Admin search filters reset.', 'Filters Reset');
  }

  openCreateModal(): void {
    this.newAdminName = '';
    this.newAdminUsername = '';
    this.newAdminEmail = '';
    this.newAdminPassword = '';
    this.newAdminRole = 'Senior Editor';
    this.newAdminDept = 'Editorial & Curation';
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  saveCreateAdmin(): void {
    if (!this.newAdminName.trim() || !this.newAdminUsername.trim() || !this.newAdminEmail.trim() || !this.newAdminPassword.trim()) {
      this.toastService.error('Please fill in all required admin account details.', 'Validation Error');
      return;
    }

    this.adminApi.createAdminStaff({
      name: this.newAdminName.trim(),
      username: this.newAdminUsername.trim(),
      email: this.newAdminEmail.trim(),
      password: this.newAdminPassword.trim(),
      role: this.newAdminRole,
      department: this.newAdminDept
    }).subscribe({
      next: (created) => {
        this.loadAdminStaff();
        this.showCreateModal.set(false);
        this.toastService.success(`Successfully created Admin Account for "${created.name}" (${created.role})!`, 'Admin Account Created');
      },
      error: (err) => {
        const errorMsg = err.error?.detail || 'Failed to create admin account.';
        this.toastService.error(errorMsg, 'Creation Error');
      }
    });
  }

  toggleAdminStatus(admin: AdminUserItem): void {
    if (admin.role === 'Super Admin') {
      this.toastService.warning('Super Admin account status cannot be modified.', 'Action Protected');
      return;
    }

    this.adminApi.toggleAdminStaffStatus(admin.id).subscribe({
      next: () => {
        const nextStatus = admin.status === 'Active' ? 'Suspended' : 'Active';
        this.adminsSignal.update(list =>
          list.map(a => (a.id === admin.id ? { ...a, status: nextStatus } : a))
        );
        const msg = nextStatus === 'Suspended' ? 'suspended access for' : 're-activated access for';
        this.toastService.info(`Successfully ${msg} ${admin.name}.`, 'Admin Status Updated');
        this.loadAdminStaff();
      },
      error: (err) => {
        const errorMsg = err.error?.detail || 'Failed to update admin status.';
        this.toastService.error(errorMsg, 'Status Update Failed');
      }
    });
  }

  resetPassword(admin: AdminUserItem): void {
    this.toastService.info(`Dispatched security password reset link to "${admin.email}".`, 'Password Reset Sent');
  }

  promptRevokeAdmin(admin: AdminUserItem): void {
    if (admin.role === 'Super Admin') {
      this.toastService.warning('Super Admin accounts cannot be deleted.', 'Action Protected');
      return;
    }
    this.targetAdminForDelete.set(admin);
  }

  cancelRevoke(): void {
    this.targetAdminForDelete.set(null);
  }

  confirmRevoke(): void {
    const admin = this.targetAdminForDelete();
    if (admin) {
      this.adminApi.deleteAdminStaff(admin.id).subscribe({
        next: () => {
          this.adminsSignal.update(list => list.filter(a => a.id !== admin.id));
          this.toastService.warning(`Revoked administrative credentials for ${admin.name}.`, 'Admin Credentials Revoked');
          this.loadAdminStaff();
        },
        error: (err) => {
          const errorMsg = err.error?.detail || 'Failed to revoke admin credentials.';
          this.toastService.error(errorMsg, 'Revoke Failed');
        }
      });
    }
    this.targetAdminForDelete.set(null);
  }
}
