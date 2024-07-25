import { getEnvVars } from "$lib/utils/env-vars.utils";

const envVars = getEnvVars();

export const IDENTITY_SERVICE_URL = envVars.identityServiceUrl;
export const OLD_MAINNET_IDENTITY_SERVICE_URL = "https://identity.ic0.app";

// The authentication expires after 24 hours
export const AUTH_SESSION_DURATION = BigInt(24 * 60 * 60 * 1_000_000_000);
