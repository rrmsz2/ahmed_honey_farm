/** Omani rial: up to 3 decimals (baisa), trailing zeros trimmed. */
export const formatMoney = (value, language = 'ar') => {
  const number = Number(value || 0).toLocaleString(language === 'ar' ? 'ar-OM' : 'en-OM', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  return language === 'ar' ? `${number} ر.ع` : `OMR ${number}`;
};

const RESIZABLE_HOSTS = ['images.unsplash.com'];

/** Adds Unsplash resize params; other URLs are returned untouched. */
export const imageUrl = (url, { w, h, q = 80 } = {}) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (!RESIZABLE_HOSTS.includes(parsed.hostname)) return url;
    if (w) parsed.searchParams.set('w', w);
    if (h) parsed.searchParams.set('h', h);
    if (w && h) parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('q', q);
    parsed.searchParams.set('auto', 'format');
    return parsed.toString();
  } catch {
    return url;
  }
};

export const formatDateTime = (value, language = 'ar') =>
  new Date(value).toLocaleString(language === 'ar' ? 'ar-OM' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export const whatsappLink = (phone, message) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};

export const scrollToSection = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
