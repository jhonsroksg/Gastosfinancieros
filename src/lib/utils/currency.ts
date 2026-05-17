export function formatCurrency(amount: number, currency: string = 'HNL'): string {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
