import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

import { LucideAlertTriangle, LucideInfo, LucideCheckCircle2 } from '@lucide/angular';

export type ConfirmationType = 'danger' | 'warning' | 'primary';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [NgIf, LucideAlertTriangle, LucideInfo, LucideCheckCircle2],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss',
})
export class ConfirmationModalComponent {
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() type: ConfirmationType = 'danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
