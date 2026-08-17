import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReaderSettingsComponent } from './reader-settings';

describe('ReaderSettingsComponent', () => {
  let component: ReaderSettingsComponent;
  let fixture: ComponentFixture<ReaderSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReaderSettingsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReaderSettingsComponent);
    component = fixture.componentInstance;

    component.currentPage = 15;
    component.totalPages = 120;
    component.pageInput = 15;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit a valid page number', () => {
    let selectedPage: number | undefined;

    component.pageSelected.subscribe(page => {
      selectedPage = page;
    });

    component.pageInput = 20;
    component.goToPage();

    expect(selectedPage).toBe(20);
  });

  it('should reject an invalid page number', () => {
    let selectedPage: number | undefined;

    component.pageSelected.subscribe(page => {
      selectedPage = page;
    });

    component.pageInput = 150;
    component.goToPage();

    expect(selectedPage).toBeUndefined();
    expect(component.pageInput).toBe(15);
  });
});
