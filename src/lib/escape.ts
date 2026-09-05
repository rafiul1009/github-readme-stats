/**
 * Escapes a string for safe interpolation into XML/SVG text content or
 * attribute values. Every user-controlled string (username, custom_title,
 * font, locale, ...) must pass through this before reaching rendered output.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
