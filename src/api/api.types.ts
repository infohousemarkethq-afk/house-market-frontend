export interface ApiEnvelope<T> {
  statusCode: number;
  status: "success";
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  statusCode: number;
  status: "error";
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
