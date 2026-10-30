// Validação mínima de respostas de IA antes de persistir (Princípio IV da constituição)

const MIN_ANALYSIS_LENGTH = 200;

const FAILURE_PREFIXES = ['desculpe', "i'm sorry", 'i am sorry', 'error', 'erro'];

export function isValidAnalysis(text: unknown): text is string {
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < MIN_ANALYSIS_LENGTH) return false;
  const lower = trimmed.toLowerCase();
  return !FAILURE_PREFIXES.some((prefix) => lower.startsWith(prefix));
}
