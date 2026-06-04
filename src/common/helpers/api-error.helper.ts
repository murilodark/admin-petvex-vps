import { ApiError } from '../../core/http/errors';

export const apiErrorHelper = {
  /**
   * Generates a user-friendly error message based on the API error or status code.
   */
  getFriendlyErrorMessage(error: any): string {
    if (!error) return 'Ocorreu um erro desconhecido.';

    // Check if it is a standard ApiError
    if (error.name === 'ApiError' || error instanceof ApiError) {
      const status = error.status;
      
      switch (status) {
        case 400:
          return error.message || 'Requisição inválida. Verifique os dados digitados.';
        case 401:
          return 'Sessão expirada. Faça login novamente.';
        case 403:
          return 'Você não possui permissão para executar esta ação.';
        case 404:
          return error.message || 'Registro não encontrado.';
        case 409:
          return error.message || 'Conflito de dados. O registro já pode existir.';
        case 422:
          return error.message || 'Erro de validação nos dados informados.';
        case 500:
          return 'Erro interno do servidor. Tente novamente em alguns instantes.';
        default:
          return error.message || 'Ocorreu um erro ao processar a requisição.';
      }
    }

    // Fallback for standard Axios/JS Error objects
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
    }

    return error.message || 'Falha inesperada na comunicação com o servidor.';
  },

  /**
   * Converts ApiError details or Axios error errors list into a flattened Record<string, string>
   * for local state forms.
   */
  extractFormErrors(error: any): Record<string, string> {
    const errorMap: Record<string, string> = {};
    if (!error) return errorMap;

    const details = error.details || error.response?.data?.errors || error.response?.data?.data?.errors;
    if (details && typeof details === 'object') {
      Object.entries(details).forEach(([key, value]) => {
        const message = Array.isArray(value) ? value[0] : typeof value === 'string' ? value : '';
        if (message) {
          errorMap[key] = message;
        }
      });
    }
    return errorMap;
  },

  /**
   * Sets formal React Hook Form errors if the API returns validation errors.
   */
  mapApiErrorsToForm(error: any, setError: (field: any, errorState: any) => void): boolean {
    const extracted = this.extractFormErrors(error);
    const keys = Object.keys(extracted);
    if (keys.length > 0) {
      keys.forEach((key) => {
        setError(key as any, {
          type: 'server',
          message: extracted[key]
        });
      });
      return true;
    }
    return false;
  }
};
