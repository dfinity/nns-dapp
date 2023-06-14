import type { CanisterActorParams } from "$lib/types/canister";
/**
 * HTTP-Agent explicit CJS import for compatibility with web worker - avoid Error [RollupError]: Unexpected token (Note that you need plugins to import files that are not JavaScript)
 */
import { HttpAgent, getManagementCanister } from "@dfinity/agent/lib/cjs/index";

export {
  HttpAgent as HttpAgentCjs,
  getManagementCanister as getManagementCanisterCjs,
};

export interface CreateCanisterCjsParams
  extends Pick<CanisterActorParams, "canisterId"> {
  agent: HttpAgent;
}

export const createCanisterCjs = async <T>({
  identity,
  canisterId,
  create,
  host,
  fetchRootKey,
}: {
  create: (params: CreateCanisterCjsParams) => T;
} & CanisterActorParams): Promise<T> => {
  const agent = new HttpAgent({
    identity,
    host,
  });

  if (fetchRootKey) {
    await agent.fetchRootKey();
  }

  return create({ agent, canisterId });
};
