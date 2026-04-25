export function fmtSG(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toFixed(2)}`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}
