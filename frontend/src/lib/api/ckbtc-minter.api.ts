import { createAgent } from "$lib/api/agent.api";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  CkBTCMinterCanister,
  type MinterParams,
  type RetrieveBtcOk,
  type RetrieveBtcParams,
  type UpdateBalanceResult,
  type WithdrawalAccount,
} from "@dfinity/ckbtc";

const minterIdentityParams = ({
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

  const address = await getBTCAddressApi(minterIdentityParams(params));

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

  const result = await updateBalanceApi(minterIdentityParams(params));

  logWithTimestamp("Updating ckBTC balance: done");

  return result;
};

export const getWithdrawalAccount = async (params: {
  identity: Identity;
}): Promise<WithdrawalAccount> => {
  logWithTimestamp("Get ckBTC withdrawal account: call...");

  const {
    canister: { getWithdrawalAccount: getWithdrawalAccountApi },
  } = await ckBTCMinterCanister(params);

  const result = await getWithdrawalAccountApi();

  logWithTimestamp("Get ckBTC withdrawal account: done");

  return result;
};

export const retrieveBtc = async ({
  identity,
  ...params
}: {
  identity: Identity;
} & RetrieveBtcParams): Promise<RetrieveBtcOk> => {
  logWithTimestamp("Retrieve BTC: call...");

  const {
    canister: { retrieveBtc: retrieveBtcApi },
  } = await ckBTCMinterCanister({ identity });

  const result = await retrieveBtcApi(params);

  logWithTimestamp("Retrieve BTC: done");

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
