import { toCanisterDetails } from "$lib/canisters/ic-management/converters";
import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import { mapError } from "$lib/canisters/ic-management/ic-management.errors";
import type { CanisterStatusResponse } from "$lib/canisters/ic-management/ic-management.types";
import type { CanisterActorParams } from "$lib/types/worker";
import { mapCanisterId } from "$lib/utils/canisters.utils";
import { HttpAgentCjs, getManagementCanisterCjs } from "$lib/utils/cjs.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { ManagementCanisterRecord } from "@dfinity/agent";

export const queryCanisterDetails = async ({
  identity,
  canisterId,
  host,
  fetchRootKey,
}: CanisterActorParams): Promise<CanisterDetails> => {
  logWithTimestamp(`Getting canister ${canisterId} details call...`);
  const {
    icMgtService: { canister_status },
  } = await canisters({ identity, host, fetchRootKey });

  try {
    const canister_id = mapCanisterId(canisterId);

    const rawResponse: CanisterStatusResponse = await canister_status({
      canister_id,
    });

    const response = toCanisterDetails({
      response: rawResponse,
      canisterId: canister_id,
    });

    logWithTimestamp(`Getting canister ${canisterId} details complete.`);

    return response;
  } catch (error: unknown) {
    throw mapError(error);
  }
};

const canisters = async ({
  identity,
  host,
  fetchRootKey,
}: Omit<CanisterActorParams, "canisterId">): Promise<{
  icMgtService: ManagementCanisterRecord;
}> => {
  const agent = new HttpAgentCjs({
    identity,
    host,
  });

  if (fetchRootKey) {
    await agent.fetchRootKey();
  }

  const icMgtService = getManagementCanisterCjs({ agent });

  return { icMgtService };
};
