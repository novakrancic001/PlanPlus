export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  search?: string;
}
