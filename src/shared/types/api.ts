export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
