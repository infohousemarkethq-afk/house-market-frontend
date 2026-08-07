/** Money is stored in kobo. 12_000_000 kobo -> "₦120,000". */
export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

/** "120000" (naira, as typed) -> "12,000,000", for the "stored as … kobo" hints. */
export function toKoboLabel(naira: string | number): string {
  const clean = Number(String(naira).replace(/[^0-9.]/g, "")) || 0;
  return (clean * 100).toLocaleString("en-NG");
}

/** "120000" (naira, as typed) -> 12000000 kobo. */
export function toKobo(naira: string | number): number {
  return Math.round((Number(String(naira).replace(/[^0-9.]/g, "")) || 0) * 100);
}
