// Config replaces "import.meta.env.VITE_IDENTITY_SERVICE_URL", prettier splits it in two lines.
// prettier-ignore
export const IDENTITY_SERVICE_URL = import.meta.env.VITE_IDENTITY_SERVICE_URL as string;

// The authentication expires after 30 minutes
export const AUTH_SESSION_DURATION = BigInt(30 * 60 * 1_000_000_000);
