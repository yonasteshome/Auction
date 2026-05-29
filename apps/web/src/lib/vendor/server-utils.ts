export function formatMoney(amount: number | undefined, currency = "ETB"): string {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return `${currency} ${value.toLocaleString()}`;
}
