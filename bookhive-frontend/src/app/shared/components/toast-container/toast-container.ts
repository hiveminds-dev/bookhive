import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

import { LucideCheckCircle2, LucideAlertOctagon, LucideAlertTriangle, LucideInfo, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgFor, NgIf, LucideCheckCircle2, LucideAlertOctagon, LucideAlertTriangle, LucideInfo, LucideX],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
