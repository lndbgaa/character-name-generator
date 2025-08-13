import dayjs from "dayjs";

/**
 * Formats a date/time value to a date string (YYYY-MM-DD) in Europe/Paris timezone.
 *
 * @param {Date|string} datetime - Date object or ISO date string.
 * @returns {string} Formatted date string.
 */
export function toDateOnly(datetime: Date | string): string {
  return dayjs(datetime).tz("Europe/Paris").format("YYYY-MM-DD");
}

/**
 * Formats a date/time value to a time string (HH:mm) in Europe/Paris timezone.
 *
 * @param {Date|string} datetime - Date object or ISO date string.
 * @returns {string} Formatted time string.
 */
export function toTimeOnly(datetime: Date | string): string {
  return dayjs(datetime).tz("Europe/Paris").format("HH:mm");
}
