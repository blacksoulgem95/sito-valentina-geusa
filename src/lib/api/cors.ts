function getCorsOrigin(): string {
  // In produzione, usa la variabile d'ambiente DOMAIN
  const domain = process.env.DOMAIN || import.meta.env.DOMAIN;
  
  // Se DOMAIN è definito, usalo, altrimenti fallback a '*' per sviluppo locale
  return domain || '*';
}

export function getCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Manteniamo corsHeaders come alias per retrocompatibilità
// NOTA: Usa getCorsHeaders() negli handler OPTIONS per leggere sempre la variabile d'ambiente
export const corsHeaders = getCorsHeaders();

export function withCors(headers: HeadersInit = {}): HeadersInit {
  return {
    ...getCorsHeaders(),
    ...headers,
  };
}
