/**
 * Shared utility functions for the Zelený Zvon application.
 */

/**
 * Generates a URL-friendly slug from a Czech/Slovak product name.
 * Strips diacritics, lowercases, removes non-alphanumeric characters.
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Escapes HTML special characters to prevent XSS when embedding
 * user-supplied text into email HTML templates.
 */
export function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes user text and converts newlines to <br/> for safe HTML email content.
 */
export function textToSafeHtml(text) {
  return escapeHtml(text).replace(/\n/g, '<br/>');
}
