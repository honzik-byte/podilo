export function formatCzechCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'Neuvedeno';
  }

  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatCzechPhone(phone?: string | null) {
  if (!phone) {
    return 'Neuvedeno';
  }

  const normalized = phone.replace(/\s+/g, '');
  const hasPlus = normalized.startsWith('+');
  const digits = normalized.replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('420')) {
    return `+420 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
  }

  if (digits.length === 9) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }

  if (hasPlus) {
    return `+${digits}`;
  }

  return phone;
}
