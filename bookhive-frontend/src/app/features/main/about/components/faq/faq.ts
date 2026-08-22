import {
  Component
} from '@angular/core';

export interface FrequentlyAskedQuestion {
  id: number;
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-about-faq',
  standalone: true,
  imports: [],
  templateUrl: './faq.html',
  styleUrl: './faq.scss'
})
export class Faq {

  questions: FrequentlyAskedQuestion[] = [
    {
      id: 1,
      question: 'What is BookHive?',
      answer:
        'BookHive is a modern digital library that connects readers, authors, and communities through books and shared knowledge.',
      isOpen: false
    },
    {
      id: 2,
      question: 'Is BookHive free to use?',
      answer:
        'Readers can create an account and explore free content. Some premium books and features may require a purchase or subscription.',
      isOpen: false
    },
    {
      id: 3,
      question: 'How can I publish my book?',
      answer:
        'Create an author account, open the Author Studio, upload your book and submit it for editorial review.',
      isOpen: false
    }
  ];

  toggleQuestion(
    selectedQuestion:
    FrequentlyAskedQuestion
  ): void {
    this.questions =
      this.questions.map(question => ({
        ...question,
        isOpen:
          question.id ===
          selectedQuestion.id
            ? !question.isOpen
            : false
      }));
  }
}
