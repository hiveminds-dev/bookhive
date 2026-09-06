import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

export type LegalTab = 'privacy' | 'terms' | 'intellectual-property' | 'support';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './legal.html',
  styleUrl: './legal.scss'
})
export class LegalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab = signal<LegalTab>('privacy');

  // Support form state
  supportForm = {
    name: '',
    email: '',
    subject: 'general',
    message: ''
  };

  supportSubmitted = signal(false);
  isSubmitting = signal(false);

  // FAQ open states
  openFaq = signal<number | null>(0);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab') as LegalTab | null;
      if (tab && ['privacy', 'terms', 'intellectual-property', 'support'].includes(tab)) {
        this.activeTab.set(tab);
      }
    });
  }

  setTab(tab: LegalTab): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  toggleFaq(index: number): void {
    this.openFaq.update(current => (current === index ? null : index));
  }

  submitSupport(): void {
    if (!this.supportForm.name || !this.supportForm.email || !this.supportForm.message) {
      return;
    }
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.supportSubmitted.set(true);
      this.supportForm = {
        name: '',
        email: '',
        subject: 'general',
        message: ''
      };
    }, 600);
  }

  resetSupport(): void {
    this.supportSubmitted.set(false);
  }
}
