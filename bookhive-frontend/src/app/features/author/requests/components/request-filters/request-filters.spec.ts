import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  RequestFilterStatus,
  RequestFiltersComponent
} from './request-filters';

describe('RequestFiltersComponent', () => {
  let component: RequestFiltersComponent;
  let fixture: ComponentFixture<RequestFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestFiltersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      RequestFiltersComponent
    );

    component = fixture.componentInstance;
    component.totalRequests = 24;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with All selected', () => {
    expect(component.selectedStatus)
      .toBe('All');
  });

  it('should emit the selected status', () => {
    let selectedStatus:
      RequestFilterStatus | undefined;

    component.statusChanged.subscribe(
      status => {
        selectedStatus = status;
      }
    );

    component.selectStatus('Pending');

    expect(component.selectedStatus)
      .toBe('Pending');

    expect(selectedStatus)
      .toBe('Pending');
  });

  it('should receive the total request count', () => {
    expect(component.totalRequests)
      .toBe(24);
  });
});
