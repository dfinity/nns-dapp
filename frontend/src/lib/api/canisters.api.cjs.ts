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
  host = HOST,
  fetchRootKey = FETCH_ROOT_KEY,
}: {
  identity: Identity;
  canisterId: string;
  host?: string;
  fetchRootKey?: boolean;
}): Promise<CanisterDetails> => {
  logWithTimestamp(`Getting canister ${canisterId} details call...`);
  const {
    icMgtService: { canister_status },
  } = await canisters({ identity, host, fetchRootKey });

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

const canisters = async ({
  identity,
  host,
  fetchRootKey,
}: {
  identity: Identity;
  host: string;
  fetchRootKey: boolean;
}): Promise<{
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
