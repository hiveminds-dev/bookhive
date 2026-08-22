import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  RequestsComponent
} from './requests';

describe(
  'RequestsComponent',
  () => {

    let component: RequestsComponent;
    let fixture:
      ComponentFixture<RequestsComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          RequestsComponent
        ],
        providers: [
          provideRouter([])
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(
          RequestsComponent
        );

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should filter pending requests', () => {
      component.onStatusChanged('Pending');

      expect(
        component.filteredRequests.every(
          request =>
            request.status === 'Pending'
        )
      ).toBe(true);
    });

    it('should open request details', () => {
      const request = component.requests[0];

      component.onRequestAction({
        action: 'details',
        request
      });

      expect(component.selectedRequest)
        .toEqual(request);
    });

    it('should close request details', () => {
      component.selectedRequest =
        component.requests[0];

      component.closeRequestDetails();

      expect(component.selectedRequest)
        .toBeNull();
    });
  }
);
