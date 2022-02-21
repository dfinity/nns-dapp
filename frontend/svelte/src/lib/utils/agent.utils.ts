import { HttpAgent, Identity } from "@dfinity/agent";

export const createAgent = async ({
  identity,
  host,
}: {
  identity: Identity;
  host?: string;
}): Promise<HttpAgent> => {
  const agent: HttpAgent = new HttpAgent({ identity, ...(host && { host }) });

  if (process.env.FETCH_ROOT_KEY) {
    // Fetch root key for certificate validation during development or on testnet
    await agent.fetchRootKey();
  }

  return agent;
};
