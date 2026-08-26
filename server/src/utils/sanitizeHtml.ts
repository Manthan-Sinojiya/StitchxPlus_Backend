/**
 * Server-side HTML Rich Text Sanitizer to prevent Stored XSS attacks.
 * Strips script tags, event handlers (e.g. onerror, onload), iframe/object tags, and javascript: URIs.
 */
export function sanitizeRichText(html: string): string {
  if (!html || typeof html !== 'string') return '';

  return html
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline event handlers (e.g., onclick=..., onerror=...)
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: URIs in href or src
    .replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"')
    .replace(/src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'src=""')
    // Remove iframe, object, embed tags
    .replace(/<\/?(?:iframe|object|embed|applet|form|input|button)\b[^>]*>/gi, '');
}
