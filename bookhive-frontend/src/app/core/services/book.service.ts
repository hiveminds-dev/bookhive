import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface PublicReview {
  id: number;
  user_name: string;
  avatar_letter: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface BookAuthorDetails {
  id: number;
  display_name: string;
  username: string;
  biography: string | null;
  profile_image_url: string | null;
}

export interface BookCategoryDetails {
  id: number;
  name: string;
}

export interface BookDetails {
  id: number;
  title: string;
  description: string | null;
  language: string | null;
  reading_level: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  status: string;
  published_at: string | null;
  page_count?: number | null;
  estimated_reading_time?: string | null;
  can_read: boolean;
  can_download: boolean;
  average_rating: number;
  review_count: number;
  reviews: PublicReview[];
  author: BookAuthorDetails;
  category: BookCategoryDetails;
}

export interface BookDetailsResult {
  message: string;
  data: BookDetails;
}

export interface CatalogueBook {
  id: number;
  title: string;
  description: string | null;
  language: string | null;
  reading_level: string | null;
  page_count?: number | null;
  rating?: number | null;
  review_count?: number | null;
  published_at: string | null;
  cover_url: string | null;
  author_name: string;
  category_name: string;
}

export interface PaginatedCatalogue {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  items: CatalogueBook[];
}

export interface CategoryItem {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryListResponse {
  items: CategoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface CatalogueFilterParams {
  page?: number;
  size?: number;
  search?: string;
  category_id?: number;
  language?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly http = inject(HttpClient);

  getBookDetails(bookId: number): Observable<BookDetails> {
    return this.http
      .get<BookDetailsResult>(`/api/books/${bookId}`)
      .pipe(map((response) => response.data));
  }

  getCatalogue(params?: CatalogueFilterParams): Observable<PaginatedCatalogue> {
    let httpParams = new HttpParams();

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params?.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params?.category_id) {
      httpParams = httpParams.set('category_id', params.category_id.toString());
    }
    if (params?.language && params.language.trim()) {
      httpParams = httpParams.set('language', params.language.trim());
    }

    return this.http.get<PaginatedCatalogue>('/api/catalogue/books', {
      params: httpParams,
    });
  }

  getCategories(page = 1, pageSize = 20): Observable<CategoryListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<CategoryListResponse>('/api/categories/', { params });
  }
}
