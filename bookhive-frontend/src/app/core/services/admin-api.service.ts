import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardStats {
  total_books: number;
  total_readers: number;
  total_authors: number;
  book_requests: number;
  author_requests: number;
}

export interface AdminBookItem {
  id: number;
  title: string;
  author_name: string;
  category_name: string;
  language: string | null;
  reading_level: string | null;
  status: string;
  cover_image_path: string | null;
  created_at: string;
  published_at: string | null;
}

export interface AuthorApplicationItem {
  id: number;
  user_id: number;
  full_name: string;
  pen_name: string;
  email: string;
  country: string | null;
  account_status: string;
  applied_date: string;
}

export interface SystemLogItem {
  timestamp: string;
  level: string;
  module: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private readonly http = inject(HttpClient);

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('/api/admin/dashboard/stats');
  }

  getBooks(): Observable<AdminBookItem[]> {
    return this.http.get<AdminBookItem[]>('/api/admin/books');
  }

  approveBook(bookId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/admin/books/${bookId}/approve`, {});
  }

  rejectBook(bookId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/admin/books/${bookId}/reject`, {});
  }

  getAuthorApplications(statusFilter?: string): Observable<AuthorApplicationItem[]> {
    const url = statusFilter
      ? `/api/admin/author-applications?status_filter=${encodeURIComponent(statusFilter)}`
      : '/api/admin/author-applications';
    return this.http.get<AuthorApplicationItem[]>(url);
  }

  approveAuthor(userId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/admin/authors/${userId}/approve`, {});
  }

  rejectAuthor(userId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/admin/authors/${userId}/reject`, {});
  }

  getSystemLogs(): Observable<SystemLogItem[]> {
    return this.http.get<SystemLogItem[]>('/api/admin/system-logs');
  }
}
