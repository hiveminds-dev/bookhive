import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { vi } from 'vitest';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfViewerComponent } from './pdf-viewer';

describe('PdfViewerComponent', () => {
  let component: PdfViewerComponent;
  let fixture: ComponentFixture<PdfViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfViewerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.page).toBe(1);
    expect(component.zoom).toBe(100);
  });

  it('should show empty state when no src is provided', () => {
    component.src = null;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pdf-state-container.empty')).toBeTruthy();
    expect(compiled.querySelector('.pdf-error-title')?.textContent).toContain('No PDF Selected');
  });

  it('should show loading state when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pdf-state-container.loading')).toBeTruthy();
    expect(compiled.querySelector('.pdf-spinner')).toBeTruthy();
    expect(compiled.textContent).toContain('Loading manuscript...');
  });

  it('should show error state when errorMessage is present', () => {
    component.errorMessage = 'Failed to fetch document';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pdf-state-container.error')).toBeTruthy();
    expect(compiled.querySelector('.pdf-state-text')?.textContent).toContain('Failed to fetch document');
  });

  it('should correctly normalize relative and absolute URLs', () => {
    component.src = 'storage/books/book_1.pdf';
    expect(component.resolvedSrc).toBe('/storage/books/book_1.pdf');

    component.src = '/storage/books/book_1.pdf';
    expect(component.resolvedSrc).toBe('/storage/books/book_1.pdf');

    component.src = 'https://example.com/file.pdf';
    expect(component.resolvedSrc).toBe('https://example.com/file.pdf');

    component.src = '   ';
    expect(component.resolvedSrc).toBeNull();
  });

  it('should compute page dimensions according to zoom level', () => {
    component.basePageWidth = 600;
    component.basePageHeight = 800;

    component.zoom = 100;
    expect(component.getPageWidth()).toBe(750); // 600 * 1.25 * 1.0
    expect(component.getPageHeight()).toBe(1000); // 800 * 1.25 * 1.0

    component.zoom = 120;
    expect(component.getPageWidth()).toBe(900); // 600 * 1.25 * 1.2
    expect(component.getPageHeight()).toBe(1200); // 800 * 1.25 * 1.2

    component.zoom = 80;
    expect(component.getPageWidth()).toBe(600); // 600 * 1.25 * 0.8
    expect(component.getPageHeight()).toBe(800); // 800 * 1.25 * 0.8
  });

  it('should reset rendered state when zoom changes', () => {
    component.pages = [
      { pageNumber: 1, rendered: true, rendering: false, renderedZoom: 100 },
      { pageNumber: 2, rendered: true, rendering: false, renderedZoom: 100 },
    ];

    component.zoom = 110;
    component.ngOnChanges({
      zoom: new SimpleChange(100, 110, false),
    });

    expect(component.pages[0].rendered).toBe(false);
    expect(component.pages[0].renderedZoom).toBe(0);
  });

  it('should load mock document and emit totalPages and loaded', async () => {
    const mockPage = {
      getViewport: vi.fn().mockReturnValue({ width: 595, height: 842 }),
      render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
    };

    const mockPdfDoc = {
      numPages: 12,
      getPage: vi.fn().mockResolvedValue(mockPage),
      destroy: vi.fn(),
    };

    const mockLoadingTask = {
      promise: Promise.resolve(mockPdfDoc),
      destroy: vi.fn(),
    };

    vi.spyOn(component, 'getDocument').mockReturnValue(mockLoadingTask as any);

    const totalPagesSpy = vi.spyOn(component.totalPagesChange, 'emit');
    const loadedSpy = vi.spyOn(component.loaded, 'emit');

    component.src = 'storage/books/test.pdf';
    component.ngOnChanges({
      src: new SimpleChange(null, 'storage/books/test.pdf', false),
    });

    await mockLoadingTask.promise;
    await new Promise((r) => setTimeout(r, 80));

    expect(component.getDocument).toHaveBeenCalledWith('/storage/books/test.pdf');
    expect(totalPagesSpy).toHaveBeenCalledWith(12);
    expect(loadedSpy).toHaveBeenCalled();
    expect(component.pages.length).toBe(12);
    expect(component.isLoading).toBe(false);
  });

  it('should emit loadError when document loading fails', async () => {
    const rejectedPromise = Promise.reject(new Error('Network error loading PDF'));
    // Prevent unhandled rejection warning in test runner
    rejectedPromise.catch(() => {});

    const mockLoadingTask = {
      promise: rejectedPromise,
      destroy: vi.fn(),
    };

    vi.spyOn(component, 'getDocument').mockReturnValue(mockLoadingTask as any);
    const loadErrorSpy = vi.spyOn(component.loadError, 'emit');

    component.src = 'storage/books/test_fail.pdf';
    component.ngOnChanges({
      src: new SimpleChange(null, 'storage/books/test_fail.pdf', false),
    });

    await new Promise((r) => setTimeout(r, 80));

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Network error loading PDF');
    expect(loadErrorSpy).toHaveBeenCalledWith('Network error loading PDF');
  });

  it('should emit pageChange when container is scrolled to a new page', () => {
    const pageChangeSpy = vi.spyOn(component.pageChange, 'emit');

    component.pages = [
      { pageNumber: 1, rendered: false, rendering: false, renderedZoom: 0 },
      { pageNumber: 2, rendered: false, rendering: false, renderedZoom: 0 },
    ];
    component.page = 1;

    // Simulate mock container and children
    const mockContainer = document.createElement('div');
    vi.spyOn(mockContainer, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 600,
      left: 0,
      right: 500,
      width: 500,
      height: 500,
      x: 0,
      y: 100,
      toJSON: () => {},
    });

    const page1El = document.createElement('div');
    page1El.className = 'pdf-page-container';
    page1El.setAttribute('data-page-number', '1');
    vi.spyOn(page1El, 'getBoundingClientRect').mockReturnValue({
      top: -400,
      bottom: 0,
      left: 0,
      right: 500,
      width: 500,
      height: 400,
      x: 0,
      y: -400,
      toJSON: () => {},
    });

    const page2El = document.createElement('div');
    page2El.className = 'pdf-page-container';
    page2El.setAttribute('data-page-number', '2');
    vi.spyOn(page2El, 'getBoundingClientRect').mockReturnValue({
      top: 150, // near targetY (100 + 80 = 180)
      bottom: 750,
      left: 0,
      right: 500,
      width: 500,
      height: 600,
      x: 0,
      y: 150,
      toJSON: () => {},
    });

    mockContainer.appendChild(page1El);
    mockContainer.appendChild(page2El);

    component.scrollContainer = { nativeElement: mockContainer };

    component.onContainerScroll();

    // Trigger requestAnimationFrame callback
    (component as any).detectActivePage();

    expect(pageChangeSpy).toHaveBeenCalledWith(2);
    expect(component.page).toBe(2);
  });

  it('should isolate wheel events and prevent default at boundaries to avoid outer window scroll', () => {
    const mockContainer = document.createElement('div');
    Object.defineProperty(mockContainer, 'clientHeight', { value: 600, configurable: true });
    Object.defineProperty(mockContainer, 'scrollHeight', { value: 1200, configurable: true });
    mockContainer.scrollTop = 0;

    component.scrollContainer = { nativeElement: mockContainer };

    // At top boundary (scrollTop = 0) and scrolling up (deltaY < 0)
    const upEvent = new WheelEvent('wheel', { deltaY: -50, deltaX: 0, cancelable: true });
    const preventDefaultSpy1 = vi.spyOn(upEvent, 'preventDefault');
    const stopPropagationSpy1 = vi.spyOn(upEvent, 'stopPropagation');

    component.onWheel(upEvent);

    expect(stopPropagationSpy1).toHaveBeenCalled();
    expect(preventDefaultSpy1).toHaveBeenCalled();

    // In the middle (scrollTop = 300) and scrolling down (deltaY = 50)
    mockContainer.scrollTop = 300;
    const midEvent = new WheelEvent('wheel', { deltaY: 50, deltaX: 0, cancelable: true });
    const preventDefaultSpy2 = vi.spyOn(midEvent, 'preventDefault');
    const stopPropagationSpy2 = vi.spyOn(midEvent, 'stopPropagation');

    component.onWheel(midEvent);

    expect(stopPropagationSpy2).toHaveBeenCalled();
    expect(preventDefaultSpy2).not.toHaveBeenCalled();

    // At bottom boundary (scrollTop = 600, which is scrollHeight - clientHeight)
    mockContainer.scrollTop = 600;
    const downEvent = new WheelEvent('wheel', { deltaY: 50, deltaX: 0, cancelable: true });
    const preventDefaultSpy3 = vi.spyOn(downEvent, 'preventDefault');
    const stopPropagationSpy3 = vi.spyOn(downEvent, 'stopPropagation');

    component.onWheel(downEvent);

    expect(stopPropagationSpy3).toHaveBeenCalled();
    expect(preventDefaultSpy3).toHaveBeenCalled();
  });

  it('should handle keyboard navigation keys and prevent window scrolling', () => {
    const mockContainer = document.createElement('div');
    Object.defineProperty(mockContainer, 'clientHeight', { value: 500, configurable: true });
    Object.defineProperty(mockContainer, 'scrollHeight', { value: 1500, configurable: true });
    mockContainer.scrollTop = 100;

    component.scrollContainer = { nativeElement: mockContainer };

    const downKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
    const preventSpy1 = vi.spyOn(downKeyEvent, 'preventDefault');
    component.onKeyDown(downKeyEvent);
    expect(preventSpy1).toHaveBeenCalled();
    expect(mockContainer.scrollTop).toBe(150);

    const upKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
    const preventSpy2 = vi.spyOn(upKeyEvent, 'preventDefault');
    component.onKeyDown(upKeyEvent);
    expect(preventSpy2).toHaveBeenCalled();
    expect(mockContainer.scrollTop).toBe(100);

    const homeKeyEvent = new KeyboardEvent('keydown', { key: 'Home', cancelable: true });
    component.onKeyDown(homeKeyEvent);
    expect(mockContainer.scrollTop).toBe(0);

    const endKeyEvent = new KeyboardEvent('keydown', { key: 'End', cancelable: true });
    component.onKeyDown(endKeyEvent);
    expect(mockContainer.scrollTop).toBe(1500);
  });
});
