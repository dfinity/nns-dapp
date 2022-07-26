/**
 * As long as we use the Flutter app, we need to handle the configuration with miscellaneous environment variables.
 * In addition, some of these variables have default fallback values according their environment - e.g. testnet or mainnet.
 *
 * That's why we group here the logic and default values to expose a single object - envConfig - that contains the effective configuration.
 *
 * The configuration is use in the rollup build but also in the parser of the static files - e.g. build.index.mjs to output the index.html with a CSP.
 */

import * as configFromFile from "../../deployment-config.json";

/**
 * Returns the given environment variable, if defined and non-empty, else throws an error.
 */
export function getRequiredEnvVar(key): string {
  let value = process.env[key];
  if (undefined === value || value === "") {
    value = configFromFile[key];
  }
  if (undefined === value || value === "") {
    throw new Error(`Environment variable '${key}' is undefined.`);
  }
  return value;
}

/**
 * Returns the given environment variable as an enum variant, else throws an error.
 */
export function getRequiredEnvEnum<Type>(key: string, enumType): Type {
  const value = getRequiredEnvVar(key);
  if (value !== undefined && value in enumType) {
    return value as unknown as Type;
  } else {
    throw new Error(
      `Environment variable ${key}='${value}' is not a valid ${enumType}.  Valid values are: ${Object.keys(
        enumType
      ).join(" ")}`
    );
  }
}
