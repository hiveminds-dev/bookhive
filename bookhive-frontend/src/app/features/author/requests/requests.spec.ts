import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import { of } from 'rxjs';
import { vi } from 'vitest';

import { AuthorBookItem, BookService } from '../../../core/services/book.service';
import { ToastService } from '../../../core/services/toast.service';
import { RequestsComponent } from './requests';

describe('RequestsComponent', () => {
  let component: RequestsComponent;
  let fixture: ComponentFixture<RequestsComponent>;
  let bookServiceMock: {
    getAuthorBooks: ReturnType<typeof vi.fn>;
  };
  let toastServiceMock: {
    warning: ReturnType<typeof vi.fn>;
  };

  const mockAuthorBooks: AuthorBookItem[] = [
    {
      id: 1,
      author_id: 10,
      category_id: 1,
      title: 'Echoes of Silence',
      category_name: 'Literature',
      description: 'Desc',
      language: 'English',
      reading_level: 'Beginner',
      pdf_path: 'storage/books/echoes.pdf',
      cover_image_path: 'storage/covers/echoes.jpg',
      cover_url: '/storage/covers/echoes.jpg',
      status: 'PENDING_REVIEW',
      created_at: '2023-10-24T00:00:00Z',
      updated_at: '2023-10-24T00:00:00Z',
      submitted_at: '2023-10-24T00:00:00Z',
      published_at: null
    },
    {
      id: 2,
      author_id: 10,
      category_id: 2,
      title: 'The Golden Hour',
      category_name: 'Fiction',
      description: 'Desc',
      language: 'English',
      reading_level: 'Intermediate',
      pdf_path: 'storage/books/golden.pdf',
      cover_image_path: 'storage/covers/golden.jpg',
      cover_url: '/storage/covers/golden.jpg',
      status: 'PUBLISHED',
      created_at: '2023-10-18T00:00:00Z',
      updated_at: '2023-10-18T00:00:00Z',
      submitted_at: '2023-10-18T00:00:00Z',
      published_at: '2023-10-18T00:00:00Z'
    },
    {
      id: 3,
      author_id: 10,
      category_id: 3,
      title: 'Binary Dreams',
      category_name: 'Tech',
      description: 'Desc',
      language: 'English',
      reading_level: 'Advanced',
      pdf_path: 'storage/books/binary.pdf',
      cover_image_path: 'storage/covers/binary.jpg',
      cover_url: '/storage/covers/binary.jpg',
      status: 'REJECTED',
      created_at: '2023-10-12T00:00:00Z',
      updated_at: '2023-10-12T00:00:00Z',
      submitted_at: '2023-10-12T00:00:00Z',
      published_at: null,
      rejection_reason: 'Cover resolution too low; please upload a higher-quality cover.'
    }
  ];

  beforeEach(async () => {
    bookServiceMock = {
      getAuthorBooks: vi.fn().mockReturnValue(of(mockAuthorBooks))
    };

    toastServiceMock = {
      warning: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RequestsComponent],
      providers: [
        provideRouter([]),
        { provide: BookService, useValue: bookServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load requests', () => {
    expect(component).toBeTruthy();
    expect(bookServiceMock.getAuthorBooks).toHaveBeenCalled();
    expect(component.requests.length).toBe(3);
  });

  it('should filter pending requests', () => {
    component.onStatusChanged('Pending');
    expect(
      component.filteredRequests.every(request => request.status === 'Pending')
    ).toBe(true);
  });

  it('should open and display request details including admin feedback', () => {
    const rejectedReq = component.requests.find(r => r.status === 'Rejected')!;

    component.onRequestAction({
      action: 'details',
      request: rejectedReq
    });

    expect(component.selectedRequest).toEqual(rejectedReq);
    expect(component.selectedRequest?.adminFeedback).toContain('Cover resolution too low');
  });

  it('should close request details', () => {
    component.selectedRequest = component.requests[0];
    component.closeRequestDetails();
    expect(component.selectedRequest).toBeNull();
  });
});
