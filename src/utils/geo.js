const INVALID_COUNTRY_VALUES = new Set([
  '',
  'unknown',
  'unknown region',
  'country',
  'null',
  'undefined',
  'xx',
  'zz',
]);
const INVALID_COUNTRY_CODES = new Set(['', 'XX', 'ZZ', 'EU', 'AP', 'A1', 'A2', 'O1']);

const cleanString = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

export const isValidCountryName = (value) => {
  const country = cleanString(value);
  return country.length > 0 && !INVALID_COUNTRY_VALUES.has(country.toLowerCase());
};

export const countryNameFromCode = (value) => {
  const code = cleanString(value).toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || INVALID_COUNTRY_CODES.has(code)) return '';

  try {
    const country = new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || '';
    return isValidCountryName(country) ? country : '';
  } catch {
    return '';
  }
};

export const normalizeGeo = (geo = {}) => {
  const rawCountryCode = cleanString(geo.countryCode || geo.country_code).toUpperCase();
  const countryCode = INVALID_COUNTRY_CODES.has(rawCountryCode) ? '' : rawCountryCode;
  const country = isValidCountryName(geo.country)
    ? cleanString(geo.country)
    : countryNameFromCode(countryCode);

  return {
    country,
    countryCode,
    city: cleanString(geo.city),
    region: cleanString(geo.region || geo.regionName),
    ip: geo.ip || null,
  };
};

export const getDisplayCountry = (geo, fallback = 'Location unavailable') => {
  const country = normalizeGeo(geo).country;
  return country || fallback;
};
