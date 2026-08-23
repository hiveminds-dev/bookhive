import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'Super Admin' | 'Senior Editor' | 'Manuscript Moderator' | 'Support Lead';
  roleBadgeClass: string;
  department: string;
  lastActive: string;
  twoFactor: boolean;
  status: 'Active' | 'Suspended' | 'Invited';
  avatar: string;
}

@Component({
  selector: 'app-admin-management',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, ConfirmationModalComponent],
  templateUrl: './admin-management.html',
  styleUrl: './admin-management.scss',
})
export class AdminManagementComponent {
  private readonly toastService = inject(ToastService);

  readonly adminsSignal = signal<AdminUser[]>([
    {
      id: 1,
      name: 'Alexander Wright',
      email: 'alexander.wright@bookhive.com',
      role: 'Super Admin',
      roleBadgeClass: 'role-super',
      department: 'Executive Governance',
      lastActive: 'Just now (Active)',
      twoFactor: true,
      status: 'Active',
      avatar: 'assets/images/auth/sign_in_1.png'
    },
    {
      id: 2,
      name: 'Samantha Reed',
      email: 'samantha.reed@bookhive.com',
      role: 'Senior Editor',
      roleBadgeClass: 'role-senior',
      department: 'Editorial & Curation',
      lastActive: '12 mins ago',
      twoFactor: true,
      status: 'Active',
      avatar: 'assets/images/auth/sign_in_1.png'
    },
    {
      id: 3,
      name: 'Marcus Vance',
      email: 'marcus.vance@bookhive.com',
      role: 'Manuscript Moderator',
      roleBadgeClass: 'role-moderator',
      department: 'Author Compliance',
      lastActive: '2 hours ago',
      twoFactor: false,
      status: 'Active',
      avatar: 'assets/images/auth/sign_in_1.png'
    },
    {
      id: 4,
      name: 'Elena Rostova',
      email: 'elena.rostova@bookhive.com',
      role: 'Support Lead',
      roleBadgeClass: 'role-support',
      department: 'Community & Help Desk',
      lastActive: 'Invited (Pending)',
      twoFactor: false,
      status: 'Invited',
      avatar: 'assets/images/auth/sign_in_1.png'
    }
  ]);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterRole = signal('');
  filterStatus = signal('');
  filterSortBy = signal('newest');

  showInviteModal = signal(false);
  targetAdminForDelete = signal<AdminUser | null>(null);

  newAdminName = '';
  newAdminEmail = '';
  newAdminRole: AdminUser['role'] = 'Senior Editor';
  newAdminDept = 'Editorial & Curation';

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  get filteredAdmins(): AdminUser[] {
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
    this.toastService.success('Admin accounts list filtered.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterRole.set('');
    this.filterStatus.set('');
    this.filterSortBy.set('newest');
    this.toastService.info('Admin search filters reset.', 'Filters Reset');
  }

  openInviteModal(): void {
    this.newAdminName = '';
    this.newAdminEmail = '';
    this.newAdminRole = 'Senior Editor';
    this.newAdminDept = 'Editorial & Curation';
    this.showInviteModal.set(true);
  }

  closeInviteModal(): void {
    this.showInviteModal.set(false);
  }

  saveInviteAdmin(): void {
    if (!this.newAdminName.trim() || !this.newAdminEmail.trim()) {
      this.toastService.error('Please fill in required admin details.', 'Validation Error');
      return;
    }

    let badgeClass = 'role-senior';
    if (this.newAdminRole === 'Super Admin') badgeClass = 'role-super';
    else if (this.newAdminRole === 'Manuscript Moderator') badgeClass = 'role-moderator';
    else if (this.newAdminRole === 'Support Lead') badgeClass = 'role-support';

    const newAdmin: AdminUser = {
      id: Date.now(),
      name: this.newAdminName.trim(),
      email: this.newAdminEmail.trim(),
      role: this.newAdminRole,
      roleBadgeClass: badgeClass,
      department: this.newAdminDept,
      lastActive: 'Invited (Pending)',
      twoFactor: false,
      status: 'Invited',
      avatar: 'assets/images/auth/sign_in_1.png'
    };

    this.adminsSignal.update(list => [newAdmin, ...list]);
    this.showInviteModal.set(false);
    this.toastService.success(`Sent invitation link to "${newAdmin.email}" with role "${newAdmin.role}".`, 'Admin Invited');
  }

  toggleAdminStatus(admin: AdminUser): void {
    if (admin.role === 'Super Admin') {
      this.toastService.warning('Super Admin account status cannot be modified.', 'Action Protected');
      return;
    }

    const nextStatus: AdminUser['status'] = admin.status === 'Active' ? 'Suspended' : 'Active';
    admin.status = nextStatus;
    const msg = nextStatus === 'Suspended' ? 'suspended access for' : 're-activated access for';
    this.toastService.info(`Successfully ${msg} ${admin.name}.`, 'Admin Status Updated');
  }

  resetPassword(admin: AdminUser): void {
    this.toastService.info(`Dispatched security password reset link to "${admin.email}".`, 'Password Reset Sent');
  }

  promptRevokeAdmin(admin: AdminUser): void {
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
      this.adminsSignal.update(list => list.filter(a => a.id !== admin.id));
      this.toastService.warning(`Revoked administrative credentials for ${admin.name}.`, 'Admin Credentials Revoked');
    }
    this.targetAdminForDelete.set(null);
  }
}
