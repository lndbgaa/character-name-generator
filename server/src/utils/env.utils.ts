/**
 * Retrieves an environment variable value or throws if missing.
 *
 * @param {string} name - Name of the environment variable.
 * @returns {string} The value of the environment variable.
 * @throws {Error} If the variable is not defined.
 */
export function getEnvVar(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`❌ Variable d'environnement manquante: ${name}`);
  }

  return value;
}
