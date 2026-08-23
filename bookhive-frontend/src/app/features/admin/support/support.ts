import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export class SupportComponent {
  private readonly toastService = inject(ToastService);

  searchQuery = signal('');
  showAdvanceSearch = signal(false);
  filterCategory = signal('');
  filterPriority = signal('');

  toggleAdvanceSearch(): void {
    this.showAdvanceSearch.update(v => !v);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  get filteredFaqs(): FAQItem[] {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.filterCategory().toLowerCase().trim();

    return this.faqsSignal().filter(f => {
      const matchesQ = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      if (!matchesQ) return false;

      const matchesCat = !cat || f.question.toLowerCase().includes(cat) || f.answer.toLowerCase().includes(cat);
      if (!matchesCat) return false;

      return true;
    });
  }

  applyFilters(): void {
    this.toastService.success('Filtered support topics & tickets.', 'Filter Applied');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterCategory.set('');
    this.filterPriority.set('');
    this.toastService.info('Support search filters reset.', 'Filters Reset');
  }

  readonly faqsSignal = signal<FAQItem[]>([
    {
      id: 1,
      question: 'How do I approve or reject pending book submissions?',
      answer: 'Navigate to "Book Management" or click on the pending item under "Book Requests". Review the manuscript details or digital reader, then click "Approve & Publish" or "Reject Submission".',
      isOpen: true
    },
    {
      id: 2,
      question: 'What happens when an Author application is approved?',
      answer: 'The user account role is converted to Author, granting them access to the Author Publishing Studio to upload books and manuscripts.',
      isOpen: false
    },
    {
      id: 3,
      question: 'How can I add or organize book categories?',
      answer: 'Go to "Category Management" from the navigation sidebar or Quick Actions. You can create new categories, toggle active status, or remove unused categories.',
      isOpen: false
    },
    {
      id: 4,
      question: 'How are platform system logs collected?',
      answer: 'Platform system logs track real-time security events, storage diagnostics, and API transactions. Click "System Logs ->" on the Platform Health card to inspect.',
      isOpen: false
    }
  ]);

  ticketSubject = '';
  ticketPriority = 'Medium';
  ticketMessage = '';

  toggleFAQ(item: FAQItem): void {
    item.isOpen = !item.isOpen;
  }

  submitTicket(): void {
    if (!this.ticketSubject.trim() || !this.ticketMessage.trim()) {
      this.toastService.error('Please enter a ticket subject and description.', 'Form Error');
      return;
    }

    this.toastService.success('Support ticket submitted! Ticket ID #8492 created.', 'Ticket Submitted');
    this.ticketSubject = '';
    this.ticketMessage = '';
  }
}
