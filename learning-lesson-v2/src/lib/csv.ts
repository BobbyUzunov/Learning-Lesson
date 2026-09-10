/** Encode a cell for teacher-facing spreadsheet exports (not lossless data interchange). */
export function csvCell(value: string) {
  // A quoted tab keeps formula-like input as text in Excel, including input
  // hidden behind whitespace. CSV quoting alone does not prevent formulas.
  const formulaLike = /^(?:\s*[=+\-@＝＋－＠]|[\t\r\n])/u.test(value);
  const text = formulaLike ? `\t${value}` : value;

  if (formulaLike || /[",\n\r\t]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}
