import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

export interface DashboardStats {
  total_books: number;
  total_readers: number;
  total_authors: number;
  total_admins: number;
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

export interface ReaderItem {
  id: number;
  full_name: string;
  username: string;
  email: string;
  account_status: string;
  joined_at: string;
}

export interface RecentBookItem {
  id: number;
  title: string;
  author_name: string;
  category_name: string;
  status: string;
  cover_image_path: string | null;
  created_at: string;
}

export interface RecentReaderItem {
  id: number;
  full_name: string;
  username: string;
  joined_at: string;
}

export interface RecentAuthorRequestItem {
  id: number;
  user_id: number;
  full_name: string;
  pen_name: string;
  country: string | null;
  created_at?: string;
}

export interface DashboardRecent {
  recent_books: RecentBookItem[];
  recent_readers: RecentReaderItem[];
  pending_author_requests: RecentAuthorRequestItem[];
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

  // Cached so RecentBooks, RecentAuthors, RecentRequests all share one HTTP call
  private dashboardRecentCache$: Observable<DashboardRecent> | null = null;

  // ─── Dashboard ────────────────────────────────────────────────────────────

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('/api/admin/dashboard/stats');
  }

  getDashboardRecent(): Observable<DashboardRecent> {
    if (!this.dashboardRecentCache$) {
      this.dashboardRecentCache$ = this.http
        .get<DashboardRecent>('/api/admin/dashboard/recent')
        .pipe(shareReplay(1));
    }
    return this.dashboardRecentCache$;
  }

  /** Call this to force a fresh fetch next time (e.g., after approve/reject) */
  invalidateDashboardRecent(): void {
    this.dashboardRecentCache$ = null;
  }

  // ─── Books ────────────────────────────────────────────────────────────────

  getBooks(params?: {
    search_query?: string;
    category_filter?: string;
    status_filter?: string;
    language_filter?: string;
    timeframe_filter?: string;
    sort_by?: string;
  }): Observable<AdminBookItem[]> {
    let queryParts: string[] = [];
    if (params?.search_query) queryParts.push(`search_query=${encodeURIComponent(params.search_query)}`);
    if (params?.category_filter) queryParts.push(`category_filter=${encodeURIComponent(params.category_filter)}`);
    if (params?.status_filter) queryParts.push(`status_filter=${encodeURIComponent(params.status_filter)}`);
    if (params?.language_filter) queryParts.push(`language_filter=${encodeURIComponent(params.language_filter)}`);
    if (params?.timeframe_filter) queryParts.push(`timeframe_filter=${encodeURIComponent(params.timeframe_filter)}`);
    if (params?.sort_by) queryParts.push(`sort_by=${encodeURIComponent(params.sort_by)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return this.http.get<AdminBookItem[]>(`/api/admin/books${queryString}`);
  }

  approveBook(bookId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/admin/books/${bookId}/approve`, {});
  }

  rejectBook(bookId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/admin/books/${bookId}/reject`, {});
  }

  updateBookStatus(bookId: number, status: string): Observable<{ message: string }> {
    this.invalidateDashboardRecent();
    return this.http.put<{ message: string }>(`/api/admin/books/${bookId}/status`, { status });
  }

  // ─── Authors ──────────────────────────────────────────────────────────────

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

  // ─── Readers ──────────────────────────────────────────────────────────────

  getReaders(): Observable<ReaderItem[]> {
    return this.http.get<ReaderItem[]>('/api/admin/readers');
  }

  // ─── System Logs ──────────────────────────────────────────────────────────

  getSystemLogs(): Observable<SystemLogItem[]> {
    return this.http.get<SystemLogItem[]>('/api/admin/system-logs');
  }
}

