import { FETCH_ROOT_KEY } from "$lib/constants/environment.constants";
import { nonNullish } from "$lib/utils/utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import { createAgent as createAgentUtil } from "@dfinity/utils";

type PrincipalAsText = string;
let agents: Record<PrincipalAsText, HttpAgent> | undefined | null = undefined;

export const createAgent = async ({
  identity,
  host,
}: {
  identity: Identity;
  host?: string;
}): Promise<HttpAgent> => {
  const principalAsText: string = identity.getPrincipal().toText();

  if (agents?.[principalAsText] === undefined) {
    const agent = await createAgentUtil({
      identity,
      ...(host !== undefined && { host }),
      fetchRootKey: FETCH_ROOT_KEY,
    });

    agents = {
      ...(nonNullish(agents) && agents),
      [principalAsText]: agent,
    };
  }

  return agents[principalAsText];
};

export const resetAgents = () => (agents = null);
