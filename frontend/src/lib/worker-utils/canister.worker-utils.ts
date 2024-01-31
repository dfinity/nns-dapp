import type { CanisterId } from "$lib/types/canister";
import type { CanisterActorParams } from "$lib/types/worker";
import type { Agent } from "@dfinity/agent";
import { createAgent } from "@dfinity/utils";

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
  const agent = await createAgent({
    identity,
    host,
    fetchRootKey,
  });

  return create({ agent, canisterId });
};
