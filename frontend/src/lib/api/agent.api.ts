import { FETCH_ROOT_KEY } from "$lib/constants/environment.constants";
import type { Agent, Identity } from "@dfinity/agent";
import { createAgent as createAgentUtil, nonNullish } from "@dfinity/utils";

type PrincipalAsText = string;
let agents: Record<PrincipalAsText, Agent> | undefined | null = undefined;

export const createAgent = async ({
  identity,
  host,
}: {
  identity: Identity;
  host?: string;
}): Promise<Agent> => {
  const principalAsText: string = identity.getPrincipal().toText();

  // e.g. a particular agent for anonymous call and another for signed-in identity
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
