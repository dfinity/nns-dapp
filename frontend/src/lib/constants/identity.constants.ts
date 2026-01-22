import { getEnvVars } from "$lib/utils/env-vars.utils";

const envVars = getEnvVars();

export const IDENTITY_SERVICE_URL = envVars.identityServiceUrl;
export const BETA_IDENTITY_SERVICE_URL =
  "https://beta.identity.internetcomputer.org/";
export const OLD_MAINNET_IDENTITY_SERVICE_URL = "https://identity.ic0.app";
export const OLD_BETA_IDENTITY_SERVICE_URL = "https://beta.identity.ic0.app";

// The authentication expires after 60 minutes
export const AUTH_SESSION_DURATION = BigInt(60 * 60 * 1_000_000_000);
