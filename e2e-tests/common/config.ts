import * as dotenv from "dotenv";
dotenv.config({ path: "../../frontend/.env" });

/**
 * Returns the given environment variable, if defined and non-empty, else throws an error.
 *
 * In the CI, process variable are used.
 * Locally, if not provided, .env file of NNS-dapp will be read
 */
export function getRequiredEnvVar(key): string {
  const value = process.env[key];

  if (undefined !== value && value !== "") {
    return value;
  }

  const envValue = process.env[key];

  if (undefined === envValue || envValue === "") {
    throw new Error(`Environment variable '${key}' is undefined.`);
  }

  return envValue;
}
