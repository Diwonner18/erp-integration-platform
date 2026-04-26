/**
 * Sanitiza mensagens de erro antes de exibir ao usuário (OWASP A05/A09).
 * Bloqueia vazamento de detalhes internos do banco (nomes de tabelas, colunas,
 * constraints, hints do PostgREST) que podem ser explorados por atacantes.
 *
 * Mantém intactas as mensagens lançadas manualmente pelo app via `throw new Error("...")`,
 * pois essas já são amigáveis e foram escritas para o usuário final.
 */

const LEAKY_PATTERNS: RegExp[] = [
  /duplicate key value/i,
  /violates (foreign key|check|not-null|unique|row-level security)/i,
  /permission denied/i,
  /relation "[^"]+" does not exist/i,
  /column "[^"]+"/i,
  /syntax error/i,
  /JWT/i,
  /pg_/i,
  /policy "[^"]+"/i,
  /\bschema\b/i,
];

const isLikelyInternalLeak = (msg: string): boolean =>
  LEAKY_PATTERNS.some((re) => re.test(msg));

/**
 * Converte um erro arbitrário em mensagem segura para exibição ao usuário.
 * @param err Erro capturado (qualquer tipo)
 * @param fallback Mensagem genérica usada quando o erro vaza detalhes internos
 */
export function getSafeErrorMessage(
  err: unknown,
  fallback = 'Ocorreu um erro. Tente novamente.'
): string {
  if (!err) return fallback;

  // Zod errors: pega a primeira mensagem amigável
  const anyErr = err as any;
  if (Array.isArray(anyErr?.issues) && anyErr.issues.length > 0) {
    const first = anyErr.issues[0]?.message;
    if (typeof first === 'string' && first.trim().length > 0) {
      return first;
    }
  }

  let message: string | undefined;

  if (typeof err === 'string') {
    message = err;
  } else if (err instanceof Error) {
    message = err.message;
  } else if (typeof anyErr?.message === 'string') {
    message = anyErr.message;
  }

  if (!message || message.trim().length === 0) return fallback;

  // Defesa: nunca mostrar mensagens com cara de erro técnico
  if (isLikelyInternalLeak(message)) return fallback;

  // Limita tamanho para evitar layout breaking ou injeção visual
  return message.length > 240 ? message.slice(0, 240) + '…' : message;
}
