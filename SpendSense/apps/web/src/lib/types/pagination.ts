export interface Pagination {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
}

export interface PaginatedResponse<T> {
  pagination: Pagination;
  results: T[];
}
