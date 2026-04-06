export function normalizePhone(phone) {
  let p = phone.trim();
  if (p.startsWith('+84')) {
    p = '0' + p.slice(3);
  }
  return p;
};

export function isValidPhone(phone) {
  return /^(0)[0-9]{9}$/.test(phone);
};