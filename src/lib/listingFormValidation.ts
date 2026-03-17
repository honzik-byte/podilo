export function isValidShareSize(value: string) {
  const trimmed = value.trim();
  const match = /^(\d+)\s*\/\s*(\d+)$/.exec(trimmed);

  if (!match) {
    return false;
  }

  const numerator = Number(match[1]);
  const denominator = Number(match[2]);

  return numerator > 0 && denominator > 0 && numerator <= denominator;
}

export function isValidListingPhone(value: string) {
  const normalized = value.replace(/\s+/g, '');
  return /^\+?[0-9]{9,15}$/.test(normalized);
}
