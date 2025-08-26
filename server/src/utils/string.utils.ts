/**
 * Escapes special SQL LIKE characters (% and _) with a backslash.
 *
 * @param {string} input - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeLike(input: string): string {
  return input.replace(/([%_\\])/g, "\\$1");
}

/**
 *
 * @param label
 * @returns
 */
export function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

/**
 * Capitalizes the first letter of each word in a string.
 *
 * @param {string} str - The input string to capitalize.
 * @returns {string} The capitalized string.
 */
export function capitalize(str: string): string {
  if (!str) return str;

  return str
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase());
}
