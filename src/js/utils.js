const FORMATTER = new Intl.NumberFormat('en', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAmount(value) {
  return `R ${FORMATTER.format(value)}`;
}
