import { Component, Input, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucideNetwork,
  LucideBook,
  LucideUsers,
  LucideShieldCheck,
} from '@lucide/angular';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [NgIf, RouterLink, LucideNetwork, LucideBook, LucideUsers, LucideShieldCheck],
  templateUrl: './activity.html',
  styleUrl: './activity.scss',
})
export class Activity {
  private readonly router = inject(Router);

  @Input() isSuperAdmin = false;

  addCategory(): void {
    this.router.navigate(['/admin/categories']);
  }

  manageAdmins(): void {
    this.router.navigate(['/admin/admins']);
  }
}
