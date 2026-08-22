import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-reader-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ReaderProfile {
  private readonly auth = inject(Auth);

  readonly user = this.auth.currentUser;

  readonly displayName = computed(
    () => this.user()?.full_name ?? 'Reader'
  );

  readonly username = computed(
    () => this.user()?.username ? `@${this.user()?.username}` : 'Reader account'
  );

  readonly status = computed(
    () => this.user()?.account_status ?? 'inactive'
  );
}
