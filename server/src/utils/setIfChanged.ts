export function setIfChanged(target: Record<string, any>, key: string, value: any, allowedToBeNull: boolean): boolean {
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
