import { getEnvVars } from "$lib/utils/env-vars.utils";

const envVars = getEnvVars();

export const IDENTITY_SERVICE_URL = envVars.identityServiceUrl;

// The authentication expires after 60 minutes
export const AUTH_SESSION_DURATION = BigInt(60 * 60 * 1_000_000_000);
