import type { CanisterId } from "$lib/types/canister";
import type { CanisterActorParams } from "$lib/types/worker";
import { HttpAgent, type Agent } from "@dfinity/agent";

export interface CreateCanisterWorkerParams {
  canisterId: CanisterId;
  agent: Agent;
}

export const createCanisterWorker = async <T>({
  identity,
  canisterId,
  create,
  host,
  fetchRootKey,
}: {
  create: (params: CreateCanisterWorkerParams) => T;
} & CanisterActorParams & { canisterId: CanisterId }): Promise<T> => {
  const agent = new HttpAgent({
    identity,
    host,
  });

  if (fetchRootKey) {
    await agent.fetchRootKey();
  }

  return create({ agent, canisterId });
};
