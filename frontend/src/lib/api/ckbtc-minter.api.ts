import { createAgent } from "$lib/api/agent.api";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  CkBTCMinterCanister,
  type MinterParams,
  type UpdateBalanceResult,
} from "@dfinity/ckbtc";

export const minterParams = ({
  identity,
}: {
  identity: Identity;
}): MinterParams => {
  // We use the identity to follow NNS-dapp's scheme but, if it would not be provided, it would be the same result.
  // If "owner" is not provided, the minter canister uses the "caller" as a fallback.
  // TODO: Support subaccounts
  return {
    owner: identity.getPrincipal(),
  };
};

export const getBTCAddress = async (params: {
  identity: Identity;
}): Promise<string> => {
  logWithTimestamp("Getting BTC address: call...");

  const {
    canister: { getBtcAddress: getBTCAddressApi },
  } = await ckBTCMinterCanister(params);

  const address = await getBTCAddressApi(minterParams(params));

  logWithTimestamp("Getting BTC address: done");

  return address;
};

export const updateBalance = async (params: {
  identity: Identity;
}): Promise<UpdateBalanceResult> => {
  logWithTimestamp("Updating ckBTC balance: call...");

  const {
    canister: { updateBalance: updateBalanceApi },
  } = await ckBTCMinterCanister(params);

  const result = await updateBalanceApi(minterParams(params));

  logWithTimestamp("Updating ckBTC balance: done");

  return result;
};

const ckBTCMinterCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: CkBTCMinterCanister;
  agent: HttpAgent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = CkBTCMinterCanister.create({
    agent,
    canisterId: CKBTC_MINTER_CANISTER_ID,
  });

  return {
    canister,
    agent,
  };
};
