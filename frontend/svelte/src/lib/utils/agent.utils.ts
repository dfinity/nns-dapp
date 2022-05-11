import type { Identity } from "@dfinity/agent";
import { HttpAgent } from "@dfinity/agent";
import { FETCH_ROOT_KEY } from "../constants/environment.constants";

export const createAgent = async ({
  identity,
  host,
}: {
  identity: Identity;
  host?: string;
}): Promise<HttpAgent> => {
  const agent: HttpAgent = new HttpAgent({
    identity,
    ...(host !== undefined && { host }),
  });

  if (FETCH_ROOT_KEY) {
    // Fetch root key for certificate validation during development or on testnet
    await agent.fetchRootKey();
  }

  return agent;
};
