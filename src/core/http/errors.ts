export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public status: number;
  public details?: Record<string, string[]>;

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function parseApiError(error: any): ApiError {
  if (error && error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    let message = 'Ocorreu um erro inesperado.';
    let details: Record<string, string[]> | undefined;

    if (data) {
      if (typeof data === 'string') {
        message = data;
      } else if (typeof data === 'object') {
        message = data.message || data.error || message;
        details = data.errors;
      }
    }

    return new ApiError(message, status, details);
  }

  return new ApiError(error?.message || 'Erro de conexão com o servidor.', 500);
}
