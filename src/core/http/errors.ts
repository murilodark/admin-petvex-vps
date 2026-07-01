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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseApiError(error: unknown): ApiError {
  if (isRecord(error) && isRecord(error.response)) {
    const status = typeof error.response.status === 'number' ? error.response.status : 500;
    const data = error.response.data;

    let message = status === 403
      ? 'Acesso negado. Você não tem permissão para executar esta ação.'
      : 'Ocorreu um erro inesperado.';
    let details: Record<string, string[]> | undefined;

    if (data) {
      if (typeof data === 'string') {
        message = data;
      } else if (isRecord(data)) {
        if (typeof data.message === 'string') {
          message = data.message;
        } else if (typeof data.error === 'string') {
          message = data.error;
        }

        if (isRecord(data.errors)) {
          details = Object.fromEntries(
            Object.entries(data.errors).filter(
              (entry): entry is [string, string[]] =>
                typeof entry[0] === 'string' &&
                Array.isArray(entry[1]) &&
                entry[1].every((item) => typeof item === 'string'),
            ),
          );
        }
      }
    }

    return new ApiError(message, status, details);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }

  return new ApiError('Erro de conexão com o servidor.', 500);
}
