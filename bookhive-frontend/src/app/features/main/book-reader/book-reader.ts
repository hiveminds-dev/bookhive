import {
  Component,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  ReaderChapter,
  ReaderSidebarComponent
} from './components/reader-sidebar/reader-sidebar';

import {
  ReaderToolbarComponent
} from './components/reader-toolbar/reader-toolbar';

import {
  BookContentComponent
} from './components/book-content/book-content';

import {
  ReaderSettingsComponent
} from './components/reader-settings/reader-settings';

import {
  PageNavigationComponent
} from './components/page-navigation/page-navigation';

interface ReaderBook {
  id: number;
  title: string;
  author: string;
  category: string;
  language: string;
  cover: string;
  totalPages: number;
  rating: number;
}

interface ReaderPageContent {
  chapterNumber: number;
  chapterTitle: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
  imagePosition: number;
}

@Component({
  selector: 'app-book-reader',
  standalone: true,

  imports: [
    ReaderSidebarComponent,
    ReaderToolbarComponent,
    BookContentComponent,
    ReaderSettingsComponent,
    PageNavigationComponent
  ],

  templateUrl: './book-reader.html',
  styleUrl: './book-reader.scss'
})
export class BookReaderComponent implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private timerId?: ReturnType<typeof setInterval>;

  readonly secondsRequiredToReadPage = 30;

  bookId = Number(
    this.route.snapshot.paramMap.get('id')
  ) || 1;

  /*
   * User දැන් බලමින් සිටින page එක.
   */
  currentPage = 1;

  /*
   * අවම තත්පර 30ක් කියවීමෙන් save වුණු page එක.
   */
  lastReadPage = 1;

  zoomLevel = 100;
  secondsRemaining = this.secondsRequiredToReadPage;

  bookmarked = false;
  pageQualifiedAsRead = false;
  isLoading = false;

  book: ReaderBook = {
    id: this.bookId,
    title: 'The Architecture of Light',
    author: 'Eliza Reed',
    category: 'Design',
    language: 'English',
    cover: 'images/reader/architecture-of-light.jpg',
    totalPages: 120,
    rating: 4.9
  };

  chapters: ReaderChapter[] = [
    {
      page: 1,
      title: 'Introduction'
    },
    {
      page: 20,
      title: 'The Prism Effect'
    },
    {
      page: 40,
      title: 'Vertical Voids'
    },
    {
      page: 60,
      title: 'Shadow Mapping'
    },
    {
      page: 80,
      title: 'Glass Facades'
    },
    {
      page: 100,
      title: 'Natural Cycles'
    }
  ];

  private readonly pageContents: ReaderPageContent[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Introduction',

      paragraphs: [
        'Light is one of the most fundamental elements of architecture. It defines the boundaries of a room, reveals materials and changes how we experience space.',

        'Every opening, surface and shadow participates in the visual rhythm of a building. Understanding light allows the architect to shape emotion as deliberately as form.',

        'This chapter introduces the relationship between natural illumination and the structures through which it passes.'
      ],

      image: 'images/reader/chapter-light.jpg',
      imageAlt:
        'Natural light entering a modern interior',
      imagePosition: 1
    },

    {
      chapterNumber: 2,
      chapterTitle: 'The Prism Effect',

      paragraphs: [
        'When light passes through glass, its path changes. Refraction separates ordinary illumination into layers of colour, texture and intensity.',

        'Architectural glass can function as more than a transparent boundary. It becomes an instrument that reshapes the atmosphere throughout the day.',

        'The direction and thickness of each surface influence how light reaches the spaces beyond it.'
      ],

      image: 'images/reader/chapter-prism.jpg',
      imageAlt:
        'Light refracting through architectural glass',
      imagePosition: 1
    },

    {
      chapterNumber: 3,
      chapterTitle: 'Vertical Voids',

      paragraphs: [
        'Vertical openings carry daylight deep into a building. Atriums, courtyards and light wells connect multiple floors through a shared source of illumination.',

        'These spaces create orientation and reveal the movement of time as sunlight travels across walls and floors.',

        'A carefully proportioned void can make even a dense structure feel open and breathable.'
      ],

      image: 'images/reader/chapter-vertical.jpg',
      imageAlt:
        'A bright vertical architectural void',
      imagePosition: 1
    },

    {
      chapterNumber: 4,
      chapterTitle: 'The Geometry of Dawn',

      paragraphs: [
        'In the quiet stillness of the early morning, light acts not merely as a visibility tool, but as a sculptor. It carves out shapes from the darkness, redefining the boundaries of a room before the first mechanical switch is ever flipped.',

        'To design for light is to design for time. Every window is a calendar, every shadow a clock. When Eliza Reed argues that the modern facade is a living organ, she refers specifically to the translucent materials that breathe photons into the structural skeleton.',

        'Observe the way a single beam of golden light intersects with a white marble pillar. The texture revealed in that fleeting moment is more truthful than any uniform artificial illumination could ever hope to be.'
      ],

      image: 'images/reader/chapter-light.jpg',
      imageAlt:
        'Morning light entering a modern architectural space',
      imagePosition: 1
    },

    {
      chapterNumber: 5,
      chapterTitle: 'Glass Facades',

      paragraphs: [
        'A glass facade changes continually as the sky, weather and surrounding city are reflected across its surface.',

        'Transparency must be balanced with temperature, privacy and the visual comfort of the people inside.',

        'Successful facade design treats glass as an active environmental system rather than a decorative skin.'
      ],

      image: 'images/reader/chapter-glass.jpg',
      imageAlt:
        'Modern glass building facade',
      imagePosition: 1
    },

    {
      chapterNumber: 6,
      chapterTitle: 'Natural Cycles',

      paragraphs: [
        'Natural light follows cycles that architecture cannot control, but can thoughtfully receive. Morning, noon and evening each produce a distinct spatial character.',

        'Seasonal changes alter the angle, duration and warmth of illumination. A responsive building acknowledges these changes rather than resisting them.',

        'Designing with natural cycles creates spaces that feel connected to the world beyond their walls.'
      ],

      image: 'images/reader/chapter-natural.jpg',
      imageAlt:
        'Natural daylight changing through the day',
      imagePosition: 1
    }
  ];

  get currentContent(): ReaderPageContent {
    if (this.currentPage >= 100) {
      return this.pageContents[5];
    }

    if (this.currentPage >= 80) {
      return this.pageContents[4];
    }

    if (this.currentPage >= 60) {
      return this.pageContents[3];
    }

    if (this.currentPage >= 40) {
      return this.pageContents[2];
    }

    if (this.currentPage >= 20) {
      return this.pageContents[1];
    }

    return this.pageContents[0];
  }

  get progressStorageKey(): string {
    return `bookhive-reading-progress-${this.bookId}`;
  }

  get bookmarkStorageKey(): string {
    return `bookhive-bookmark-${this.bookId}`;
  }

  ngOnInit(): void {
    this.restoreReadingProgress();
    this.restoreBookmark();
    this.startPageReadingTimer();
  }

  ngOnDestroy(): void {
    this.stopPageReadingTimer();
  }

  nextPage(): void {
    if (this.currentPage >= this.book.totalPages) {
      return;
    }

    this.changePage(this.currentPage + 1);
  }

  previousPage(): void {
    if (this.currentPage <= 1) {
      return;
    }

    this.changePage(this.currentPage - 1);
  }

  goToPage(page: number): void {
    this.changePage(page);
  }

  selectChapter(chapter: ReaderChapter): void {
    this.changePage(chapter.page);
  }

  changePage(page: number): void {
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > this.book.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.pageQualifiedAsRead = false;

    this.restartPageReadingTimer();
    this.scrollReaderToTop();
  }

  zoomIn(): void {
    if (this.zoomLevel < 150) {
      this.zoomLevel += 10;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 50) {
      this.zoomLevel -= 10;
    }
  }

  onBookmarkChanged(bookmarked: boolean): void {
    this.bookmarked = bookmarked;

    localStorage.setItem(
      this.bookmarkStorageKey,
      JSON.stringify(bookmarked)
    );
  }

  downloadBook(): void {
    console.log('Download book:', this.bookId);
  }

  shareExcerpt(): void {
    console.log(
      'Share excerpt from page:',
      this.currentPage
    );
  }

  reportIssue(): void {
    console.log(
      'Report issue on page:',
      this.currentPage
    );
  }

  openFullscreen(): void {
    const readerElement =
      document.querySelector(
        '.reader-workspace'
      ) as HTMLElement | null;

    if (!readerElement) {
      return;
    }

    if (!document.fullscreenElement) {
      readerElement.requestFullscreen();
      return;
    }

    document.exitFullscreen();
  }

  backToLibrary(): void {
    this.router.navigate(['/explore']);
  }

  /*
   * Page එකට timer එක start කරනවා.
   * Automatically next page එකට යන්නේ නැහැ.
   */
  private startPageReadingTimer(): void {
    this.stopPageReadingTimer();

    this.secondsRemaining =
      this.secondsRequiredToReadPage;

    this.pageQualifiedAsRead = false;

    this.timerId = setInterval(() => {
      this.secondsRemaining -= 1;

      if (this.secondsRemaining <= 0) {
        this.markCurrentPageAsRead();
        this.stopPageReadingTimer();
      }
    }, 1000);
  }

  private restartPageReadingTimer(): void {
    this.startPageReadingTimer();
  }

  private stopPageReadingTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  /*
   * User page එකේ තත්පර 30ක් සිටියොත් පමණක්
   * page එක read ලෙස save කරනවා.
   */
  private markCurrentPageAsRead(): void {
    this.pageQualifiedAsRead = true;
    this.secondsRemaining = 0;

    this.lastReadPage = this.currentPage;
    this.saveReadingProgress();
  }

  private saveReadingProgress(): void {
    localStorage.setItem(
      this.progressStorageKey,
      String(this.lastReadPage)
    );
  }

  /*
   * User නැවත book එක open කළාම save කරපු page එක
   * current page එක ලෙස restore කරනවා.
   */
  private restoreReadingProgress(): void {
    const savedPage = Number(
      localStorage.getItem(this.progressStorageKey)
    );

    if (
      Number.isInteger(savedPage) &&
      savedPage >= 1 &&
      savedPage <= this.book.totalPages
    ) {
      this.lastReadPage = savedPage;
      this.currentPage = savedPage;
      return;
    }

    this.lastReadPage = 1;
    this.currentPage = 1;
  }

  private restoreBookmark(): void {
    const savedBookmark =
      localStorage.getItem(this.bookmarkStorageKey);

    this.bookmarked = savedBookmark === 'true';
  }

  private scrollReaderToTop(): void {
    const readerCenter = document.querySelector<HTMLElement>('.reader-center');

    if (typeof readerCenter?.scrollIntoView !== 'function') {
      return;
    }

    readerCenter.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
