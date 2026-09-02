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

/**
 * Czech takes three plural forms: 1, 2-4, and 0 or 5+. Writing "1 nabídek"
 * reads as broken to a native speaker, so counts always go through here.
 */
export function czechPlural(count: number, one: string, few: string, many: string) {
  if (count === 1) {
    return one;
  }

  if (count >= 2 && count <= 4) {
    return few;
  }

  return many;
}

export function formatListingCount(count: number) {
  return `${count} ${czechPlural(count, 'nabídka', 'nabídky', 'nabídek')}`;
}

export function formatActiveListingCount(count: number) {
  return `${count} ${czechPlural(count, 'aktivní nabídka', 'aktivní nabídky', 'aktivních nabídek')}`;
}

export function formatMatchingListingCount(count: number) {
  return `${count} ${czechPlural(
    count,
    'odpovídající nabídka',
    'odpovídající nabídky',
    'odpovídajících nabídek'
  )}`;
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
