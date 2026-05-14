export const isValidTzPhone = (phone) => {
  const cleanPhone = String(phone || '').replace(/[\s\-()]/g, '');
  return /^(\+255|0)?7[0-9]{8}$/.test(cleanPhone);
};

export const normalizeTzPhone = (phone) => {
  const cleanPhone = String(phone || '').replace(/[\s\-()]/g, '');

  if (cleanPhone.startsWith('+255')) return cleanPhone;
  if (cleanPhone.startsWith('0')) return `+255${cleanPhone.slice(1)}`;
  if (cleanPhone.startsWith('7')) return `+255${cleanPhone}`;
  return cleanPhone;
};

export const isNonEmptyString = (value, minLength = 1) =>
  typeof value === 'string' && value.trim().length >= minLength;
