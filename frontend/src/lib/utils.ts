// Converte um texto digitado pelo usuário em número.
// Aceita tanto vírgula quanto ponto como separador decimal.
export function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}
