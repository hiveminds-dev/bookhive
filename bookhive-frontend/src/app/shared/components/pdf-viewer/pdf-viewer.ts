import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  try {
    const gwo = (pdfjsLib as any).GlobalWorkerOptions;
    if (gwo) {
      gwo.workerSrc = `https://unpkg.com/pdfjs-dist@${(pdfjsLib as any).version || '4.10.38'}/build/pdf.worker.min.mjs`;
    }
  } catch {
    // Safe fallback
  }
}

export interface PdfPageModel {
  pageNumber: number;
  rendered: boolean;
  rendering: boolean;
  renderedZoom: number;
  renderTask?: any;
}

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-viewer.html',
  styleUrl: './pdf-viewer.scss',
})
export class PdfViewerComponent implements OnInit, OnChanges, OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef);

  constructor() {
    this.configurePdfWorker();
  }

  @Input() src: string | null = null;
  @Input() page = 1;
  @Input() zoom = 100;

  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly totalPagesChange = new EventEmitter<number>();
  @Output() readonly loaded = new EventEmitter<void>();
  @Output() readonly loadError = new EventEmitter<string>();

  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  isLoading = false;
  errorMessage = '';
  totalPages = 0;
  pages: PdfPageModel[] = [];

  basePageWidth = 595;
  basePageHeight = 842;

  private pdfDoc: any = null;
  private loadingTask: any = null;
  private observer: IntersectionObserver | null = null;
  private isProgrammaticScroll = false;
  private programmaticScrollTimeout?: ReturnType<typeof setTimeout>;
  private scrollAnimationFrameId?: number;

  get resolvedSrc(): string | null {
    if (!this.src) return null;
    const trimmed = this.src.trim();
    if (!trimmed) return null;
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('data:')
    ) {
      return trimmed;
    }
    return '/' + trimmed.replace(/^\/+/, '');
  }

  ngOnInit(): void {
    this.configurePdfWorker();

    if (this.src) {
      this.loadDocument();
    }
  }

  private configurePdfWorker(): void {
    if (typeof window === 'undefined') return;

    try {
      const gwo = (pdfjsLib as any).GlobalWorkerOptions;
      if (gwo) {
        gwo.workerSrc = `https://unpkg.com/pdfjs-dist@${(pdfjsLib as any).version || '4.10.38'}/build/pdf.worker.min.mjs`;
      }
    } catch {
      // Safe fallback in test or constrained environments
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && !changes['src'].isFirstChange()) {
      this.loadDocument();
    }

    if (changes['page'] && !changes['page'].isFirstChange()) {
      const newPage = changes['page'].currentValue;
      if (newPage && typeof newPage === 'number' && !this.isProgrammaticScroll) {
        this.scrollToPage(newPage);
      }
    }

    if (changes['zoom'] && !changes['zoom'].isFirstChange()) {
      this.onZoomChanged();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  retryLoad(): void {
    this.loadDocument();
  }

  getPageWidth(): number {
    const zoomFactor = Math.max(0.5, Math.min(3.0, this.zoom / 100));
    return Math.round(this.basePageWidth * 1.25 * zoomFactor);
  }

  getPageHeight(): number {
    const zoomFactor = Math.max(0.5, Math.min(3.0, this.zoom / 100));
    return Math.round(this.basePageHeight * 1.25 * zoomFactor);
  }

  onContainerScroll(): void {
    if (this.isProgrammaticScroll || !this.scrollContainer || this.pages.length === 0) {
      return;
    }

    if (this.scrollAnimationFrameId) {
      cancelAnimationFrame(this.scrollAnimationFrameId);
    }

    this.scrollAnimationFrameId = requestAnimationFrame(() => {
      this.detectActivePage();
    });
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const deltaY = event.deltaY;
    const deltaX = event.deltaX;

    // Handle vertical scrolling boundaries
    if (Math.abs(deltaY) >= Math.abs(deltaX)) {
      const scrollTop = container.scrollTop;
      const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);

      // If at boundary, prevent default window scroll chaining
      if ((deltaY < 0 && scrollTop <= 0) || (deltaY > 0 && scrollTop >= maxScrollTop - 1)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // If delta would overshoot top boundary
      if (deltaY < 0 && scrollTop + deltaY < 0) {
        container.scrollTop = 0;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // If delta would overshoot bottom boundary
      if (deltaY > 0 && scrollTop + deltaY > maxScrollTop) {
        container.scrollTop = maxScrollTop;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    } else {
      // Handle horizontal scrolling boundaries
      const scrollLeft = container.scrollLeft;
      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);

      if ((deltaX < 0 && scrollLeft <= 0) || (deltaX > 0 && scrollLeft >= maxScrollLeft - 1)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }

    // Stop event bubbling so ancestor elements/window do not receive wheel events
    event.stopPropagation();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    if (!keys.includes(event.key)) return;

    const scrollAmount = container.clientHeight * 0.8;
    if (event.key === 'ArrowDown') {
      container.scrollTop += 50;
      event.preventDefault();
      event.stopPropagation();
    } else if (event.key === 'ArrowUp') {
      container.scrollTop -= 50;
      event.preventDefault();
      event.stopPropagation();
    } else if (event.key === 'PageDown' || event.key === ' ') {
      container.scrollTop += scrollAmount;
      event.preventDefault();
      event.stopPropagation();
    } else if (event.key === 'PageUp') {
      container.scrollTop -= scrollAmount;
      event.preventDefault();
      event.stopPropagation();
    } else if (event.key === 'Home') {
      container.scrollTop = 0;
      event.preventDefault();
      event.stopPropagation();
    } else if (event.key === 'End') {
      container.scrollTop = container.scrollHeight;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private detectActivePage(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const pageElements = container.querySelectorAll<HTMLElement>('.pdf-page-container');

    let activePage = this.page;
    let minDistance = Infinity;
    const targetY = containerRect.top + 80;

    pageElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const distance = Math.abs(rect.top - targetY);
      if (distance < minDistance) {
        minDistance = distance;
        const pageNum = Number(el.getAttribute('data-page-number'));
        if (pageNum > 0) {
          activePage = pageNum;
        }
      }
    });

    if (activePage && activePage !== this.page) {
      this.page = activePage;
      this.pageChange.emit(activePage);
      this.changeDetector.markForCheck();
    }
  }

  getDocument(src: string): any {
    return pdfjsLib.getDocument(src);
  }

  private async loadDocument(): Promise<void> {
    const targetSrc = this.resolvedSrc;
    if (!targetSrc) {
      this.cleanupDocument();
      this.isLoading = false;
      this.errorMessage = '';
      this.pages = [];
      this.changeDetector.markForCheck();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cleanupDocument();
    this.changeDetector.markForCheck();

    try {
      this.loadingTask = this.getDocument(targetSrc);
      const pdfDoc = await this.loadingTask.promise;
      this.pdfDoc = pdfDoc;
      this.totalPages = pdfDoc.numPages;
      this.totalPagesChange.emit(this.totalPages);

      let firstPageWidth = 595;
      let firstPageHeight = 842;
      try {
        const firstPage = await pdfDoc.getPage(1);
        const vp = firstPage.getViewport({ scale: 1.0 });
        firstPageWidth = vp.width;
        firstPageHeight = vp.height;
      } catch (pageErr) {
        console.warn('Could not inspect initial page viewport:', pageErr);
      }

      this.basePageWidth = firstPageWidth;
      this.basePageHeight = firstPageHeight;

      this.pages = Array.from({ length: this.totalPages }, (_, i) => ({
        pageNumber: i + 1,
        rendered: false,
        rendering: false,
        renderedZoom: 0,
      }));

      this.isLoading = false;
      this.loaded.emit();
      this.changeDetector.markForCheck();

      setTimeout(() => {
        this.setupIntersectionObserver();
        if (this.page > 1) {
          this.scrollToPage(this.page);
        } else {
          this.renderVisiblePages();
        }
      }, 50);
    } catch (error: any) {
      this.isLoading = false;
      const errorMsg = error?.message || 'Failed to load PDF document.';
      this.errorMessage = errorMsg;
      this.loadError.emit(errorMsg);
      this.changeDetector.markForCheck();
    }
  }

  private setupIntersectionObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    const container = this.scrollContainer?.nativeElement;
    if (!container || typeof IntersectionObserver === 'undefined') {
      this.renderVisiblePages();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const pageNum = Number(el.getAttribute('data-page-number'));
          if (entry.isIntersecting && pageNum) {
            void this.renderPage(pageNum);
          }
        }
      },
      {
        root: container,
        rootMargin: '300px 0px 300px 0px',
        threshold: 0.01,
      }
    );

    const pageElements = container.querySelectorAll<HTMLElement>('.pdf-page-container');
    pageElements.forEach((el) => {
      this.observer?.observe(el);
    });
  }

  private renderVisiblePages(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const pageElements = container.querySelectorAll<HTMLElement>('.pdf-page-container');
    pageElements.forEach((el) => {
      const pageNum = Number(el.getAttribute('data-page-number'));
      if (pageNum) {
        void this.renderPage(pageNum);
      }
    });
  }

  private async renderPage(pageNumber: number): Promise<void> {
    const pageItem = this.pages.find((p) => p.pageNumber === pageNumber);
    if (!pageItem || !this.pdfDoc || pageItem.rendering) return;
    if (pageItem.rendered && pageItem.renderedZoom === this.zoom) return;

    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const canvas = container.querySelector<HTMLCanvasElement>(
      `canvas[data-page-number="${pageNumber}"]`
    );
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      pageItem.rendered = true;
      pageItem.renderedZoom = this.zoom;
      return;
    }

    if (pageItem.renderTask) {
      try {
        pageItem.renderTask.cancel();
      } catch {
        // Ignored
      }
    }

    pageItem.rendering = true;
    try {
      const page = await this.pdfDoc.getPage(pageNumber);
      const zoomFactor = Math.max(0.5, Math.min(3.0, this.zoom / 100));
      const renderScale = 1.25 * zoomFactor;
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

      const viewport = page.getViewport({ scale: renderScale * dpr });
      const cssViewport = page.getViewport({ scale: renderScale });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(cssViewport.width)}px`;
      canvas.style.height = `${Math.floor(cssViewport.height)}px`;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      };

      const task = page.render(renderContext as any);
      pageItem.renderTask = task;
      await task.promise;

      pageItem.rendered = true;
      pageItem.renderedZoom = this.zoom;
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.warn(`Render error on page ${pageNumber}:`, err);
      }
    } finally {
      pageItem.rendering = false;
      pageItem.renderTask = undefined;
    }
  }

  private onZoomChanged(): void {
    for (const p of this.pages) {
      p.rendered = false;
      p.renderedZoom = 0;
    }
    this.changeDetector.markForCheck();
    setTimeout(() => {
      this.renderVisiblePages();
    }, 50);
  }

  private scrollToPage(pageNumber: number): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const targetEl = container.querySelector<HTMLElement>(`[data-page-number="${pageNumber}"]`);
    if (targetEl) {
      this.isProgrammaticScroll = true;
      if (this.programmaticScrollTimeout) {
        clearTimeout(this.programmaticScrollTimeout);
      }

      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const targetScrollTop = container.scrollTop + (targetRect.top - containerRect.top) - 16;
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
      } else {
        container.scrollTop = Math.max(0, targetScrollTop);
      }

      this.programmaticScrollTimeout = setTimeout(() => {
        this.isProgrammaticScroll = false;
      }, 500);
    }
  }

  private cleanupDocument(): void {
    for (const p of this.pages) {
      if (p.renderTask) {
        try {
          p.renderTask.cancel();
        } catch {
          // Ignored
        }
      }
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.loadingTask) {
      try {
        this.loadingTask.destroy();
      } catch {
        // Ignored
      }
      this.loadingTask = null;
    }

    if (this.pdfDoc) {
      try {
        this.pdfDoc.destroy();
      } catch {
        // Ignored
      }
      this.pdfDoc = null;
    }
  }

  private cleanup(): void {
    if (this.programmaticScrollTimeout) {
      clearTimeout(this.programmaticScrollTimeout);
    }
    if (this.scrollAnimationFrameId) {
      cancelAnimationFrame(this.scrollAnimationFrameId);
    }
    this.cleanupDocument();
  }
}
