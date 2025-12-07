function getCorsOrigin(request?: Request): string {
  // Se abbiamo una richiesta, controlla l'origin
  if (request) {
    const requestOrigin = request.headers.get('origin');
    const domain = process.env.DOMAIN || import.meta.env.DOMAIN;
    
    // Se c'è un origin nella richiesta e corrisponde al dominio configurato, usalo
    if (requestOrigin && domain) {
      try {
        const originUrl = new URL(requestOrigin);
        const domainUrl = domain.startsWith('http') ? new URL(domain) : new URL(`https://${domain}`);
        
        // Se l'origin corrisponde al dominio (stesso hostname), permetti l'origin specifico
        if (originUrl.hostname === domainUrl.hostname) {
          return requestOrigin;
        }
      } catch (e) {
        // Se l'URL non è valido, continua con la logica di fallback
      }
    }
    
    // Se DOMAIN è configurato, usalo
    if (domain) {
      return domain.startsWith('http') ? domain : `https://${domain}`;
    }
    
    // Se c'è un origin nella richiesta ma non c'è dominio configurato, permetti l'origin
    // (utile per sviluppo locale)
    if (requestOrigin) {
      return requestOrigin;
    }
  }
  
  // In produzione, usa la variabile d'ambiente DOMAIN
  const domain = process.env.DOMAIN || import.meta.env.DOMAIN;
  
  // Se DOMAIN è definito, usalo, altrimenti fallback a '*' per sviluppo locale
  return domain ? (domain.startsWith('http') ? domain : `https://${domain}`) : '*';
}

export function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = getCorsOrigin(request);
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': origin !== '*' ? 'true' : 'false',
  };
}

// Manteniamo corsHeaders come alias per retrocompatibilità
// NOTA: Usa getCorsHeaders() negli handler OPTIONS per leggere sempre la variabile d'ambiente
export const corsHeaders = getCorsHeaders();

export function withCors(headers: HeadersInit = {}, request?: Request): HeadersInit {
  return {
    ...getCorsHeaders(request),
    ...headers,
  };
}
