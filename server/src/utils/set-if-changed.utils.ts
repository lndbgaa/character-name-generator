/**
 * Sets a property on an object if the new value is different from the current one.
 *
 * Handles trimming for strings and optional null assignment.
 *
 * @param {Record<string, any>} target - The object to update.
 * @param {string} key - Property name to update.
 * @param {any} value - New value to set.
 * @param {boolean} allowedToBeNull - Whether null values are allowed.
 * @returns {boolean} True if the value was changed, false otherwise.
 */
export function setIfChanged(
  target: Record<string, any>,
  key: string,
  value: any,
  allowedToBeNull: boolean
): boolean {
  if (value === undefined) return false;

  let newValue = value;

  if (value === null) {
    if (!allowedToBeNull) return false;
    if (target[key] === null) return false;
    target[key] = null;
    return true;
  }

  if (typeof value === "string") {
    newValue = value.trim();

    if (!newValue) {
      if (!allowedToBeNull) return false;
      newValue = null;
    }
  }

  if (newValue === target[key]) return false;

  target[key] = newValue;
  return true;
}

export default setIfChanged;
