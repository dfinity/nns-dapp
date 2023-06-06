import { toCanisterDetails } from "$lib/canisters/ic-management/converters";
import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import { mapError } from "$lib/canisters/ic-management/ic-management.errors";
import type { CanisterStatusResponse } from "$lib/canisters/ic-management/ic-management.types";
import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { HttpAgentCjs, getManagementCanisterCjs } from "$lib/utils/cjs.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity, ManagementCanisterRecord } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

export const queryCanisterDetails = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: string;
}): Promise<CanisterDetails> => {
  logWithTimestamp(`Getting canister ${canisterId} details call...`);
  const {
    icMgtService: { canister_status },
  } = await canisters(identity);

  try {
    const canister_id = Principal.fromText(canisterId);

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

const canisters = async (
  identity: Identity
): Promise<{
  icMgtService: ManagementCanisterRecord;
}> => {
  const agent = new HttpAgentCjs({
    identity,
    host: HOST,
  });

  if (FETCH_ROOT_KEY) {
    await agent.fetchRootKey();
  }

  const icMgtService = getManagementCanisterCjs({ agent });

  return { icMgtService };
};
