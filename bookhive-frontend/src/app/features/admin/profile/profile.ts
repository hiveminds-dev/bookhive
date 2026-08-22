import { Component, computed, inject } from '@angular/core';

import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class AdminProfile {
  private readonly auth = inject(Auth);

  readonly user = this.auth.currentUser;

  readonly displayName = computed(
    () => this.user()?.full_name ?? 'Administrator'
  );

  readonly roleLabel = computed(
    () => this.user()?.role === 'super_admin'
      ? 'Super Admin'
      : 'Administrator'
  );

  readonly status = computed(
    () => this.user()?.account_status ?? 'active'
  );
}
