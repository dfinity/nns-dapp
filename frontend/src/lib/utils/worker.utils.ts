import { createAuthClient } from "$lib/utils/auth.utils";
import type { Identity } from "@dfinity/agent";

export const loadIdentity = async (): Promise<Identity | undefined> => {
  const authClient = await createAuthClient();
  const authenticated = await authClient.isAuthenticated();

  // Not authenticated therefore no identity to fetch the cycles
  if (!authenticated) {
    return undefined;
  }

  return authClient.getIdentity();
};
