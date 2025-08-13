/**
 * Escapes special SQL LIKE characters (% and _) with a backslash.
 *
 * @param {string} input - String to escape.
 * @returns {string} Escaped string.
 */
export function escapeLike(input: string): string {
  return input.replace(/([%_\\])/g, "\\$1");
}
