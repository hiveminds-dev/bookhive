import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LegalComponent } from './legal';

describe('LegalComponent', () => {
  let component: LegalComponent;
  let fixture: ComponentFixture<LegalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LegalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the legal component', () => {
    expect(component).toBeTruthy();
  });

  it('should default to privacy tab', () => {
    expect(component.activeTab()).toBe('privacy');
  });

  it('should allow switching tabs', () => {
    component.setTab('terms');
    expect(component.activeTab()).toBe('terms');

    component.setTab('intellectual-property');
    expect(component.activeTab()).toBe('intellectual-property');

    component.setTab('support');
    expect(component.activeTab()).toBe('support');
  });
});
