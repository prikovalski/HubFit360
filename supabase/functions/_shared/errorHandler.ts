// Generic error handler to prevent information leakage

export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: 'Entrada inválida fornecida',
  NOT_FOUND: 'Recurso não encontrado',
  UNAUTHORIZED: 'Não autorizado',
  RATE_LIMIT_EXCEEDED: 'Limite de requisições excedido. Tente novamente mais tarde',
  DEFAULT: 'Ocorreu um erro ao processar sua solicitação',
};

export interface ErrorResponse {
  success: false;
  error: string;
}

export function handleError(
  error: unknown,
  errorType: keyof typeof ERROR_MESSAGES = 'DEFAULT'
): ErrorResponse {
  // Log full error server-side for debugging
  console.error('Function error:', error);

  // Return generic message to client
  return {
    success: false,
    error: ERROR_MESSAGES[errorType] || ERROR_MESSAGES.DEFAULT,
  };
}

export function createErrorResponse(
  error: unknown,
  errorType: keyof typeof ERROR_MESSAGES = 'DEFAULT',
  status: number,
  corsHeaders: HeadersInit
): Response {
  return new Response(
    JSON.stringify(handleError(error, errorType)),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
