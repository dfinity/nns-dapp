import { toCanisterDetails } from "$lib/canisters/ic-management/converters";
import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import { mapError } from "$lib/canisters/ic-management/ic-management.errors";
import type { CanisterStatusResponse } from "$lib/canisters/ic-management/ic-management.types";
import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity, ManagementCanisterRecord } from "@dfinity/agent";
/**
 * HTTP-Agent explicit CJS import for compatibility with web worker - avoid "window undefined" issues
 */
import { getManagementCanister, HttpAgent } from "@dfinity/agent/lib/cjs/index";
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
  const agent = new HttpAgent({
    identity,
    host: HOST,
  });

  if (FETCH_ROOT_KEY) {
    await agent.fetchRootKey();
  }

  const icMgtService = getManagementCanister({ agent });

  return { icMgtService };
};
