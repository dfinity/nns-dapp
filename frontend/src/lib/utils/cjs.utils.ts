import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

/**
 * HTTP-Agent explicit CJS import for compatibility with web worker - avoid Error [RollupError]: Unexpected token (Note that you need plugins to import files that are not JavaScript)
 */
import { HttpAgent, getManagementCanister } from "@dfinity/agent/lib/cjs/index";

export {
  HttpAgent as HttpAgentCjs,
  getManagementCanister as getManagementCanisterCjs,
};

export interface CreateCanisterCjsParams {
  agent: HttpAgent;
  canisterId: Principal;
}

export const createCanisterCjs = async <T>({
  identity,
  canisterId,
  create,
}: {
  identity: Identity;
  create: (params: CreateCanisterCjsParams) => T;
} & Pick<CreateCanisterCjsParams, "canisterId">): Promise<T> => {
  const agent = new HttpAgent({
    identity,
    host: HOST,
  });

  if (FETCH_ROOT_KEY) {
    await agent.fetchRootKey();
  }

  return create({ agent, canisterId });
};
