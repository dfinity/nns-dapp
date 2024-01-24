import { createAgent } from "$lib/api/agent.api";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Agent, Identity } from "@dfinity/agent";
import {
  CkBTCMinterCanister,
  type EstimateWithdrawalFee,
  type EstimateWithdrawalFeeParams,
  type MinterInfo,
  type MinterParams,
  type RetrieveBtcOk,
  type RetrieveBtcStatusV2WithId,
  type UpdateBalanceOk,
} from "@dfinity/ckbtc";
import type { Principal } from "@dfinity/principal";
import type { QueryParams } from "@dfinity/utils";

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
  canisterId: Principal;
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
  canisterId: Principal;
}): Promise<UpdateBalanceOk> => {
  logWithTimestamp("Updating ckBTC balance: call...");

  const {
    canister: { updateBalance: updateBalanceApi },
  } = await ckBTCMinterCanister(params);

  const result = await updateBalanceApi(minterIdentityParams(params));

  logWithTimestamp("Updating ckBTC balance: done");

  return result;
};

export const retrieveBtcWithApproval = async ({
  identity,
  canisterId,
  ...params
}: {
  identity: Identity;
  canisterId: Principal;
  address: string;
  amount: bigint;
  fromSubaccount?: Uint8Array;
}): Promise<RetrieveBtcOk> => {
  logWithTimestamp("Retrieve BTC with approval: call...");

  const {
    canister: { retrieveBtcWithApproval: retrieveBtcWithApprovalApi },
  } = await ckBTCMinterCanister({ identity, canisterId });

  const result = await retrieveBtcWithApprovalApi(params);

  logWithTimestamp("Retrieve BTC with approval: done");

  return result;
};

export const retrieveBtcStatusV2ByAccount = async ({
  identity,
  canisterId,
  certified,
}: {
  identity: Identity;
  canisterId: Principal;
  certified: boolean;
}): Promise<RetrieveBtcStatusV2WithId[]> => {
  logWithTimestamp("Retrieve btc status V2 by account: call...");

  const {
    canister: { retrieveBtcStatusV2ByAccount: retrieveBtcStatusV2ByAccountApi },
  } = await ckBTCMinterCanister({ identity, canisterId });

  const result = await retrieveBtcStatusV2ByAccountApi({ certified });

  logWithTimestamp("Retrieve btc status V2 by account: done...");

  return result;
};

export const estimateFee = async ({
  identity,
  canisterId,
  ...params
}: {
  identity: Identity;
  canisterId: Principal;
} & EstimateWithdrawalFeeParams): Promise<EstimateWithdrawalFee> => {
  logWithTimestamp("Bitcoin estimated fee: call...");

  const {
    canister: { estimateWithdrawalFee: estimateFeeApi },
  } = await ckBTCMinterCanister({ identity, canisterId });

  const result = await estimateFeeApi(params);

  logWithTimestamp("Bitcoin estimated fee: done");

  return result;
};

export const minterInfo = async ({
  identity,
  canisterId,
  ...rest
}: {
  identity: Identity;
  canisterId: Principal;
} & QueryParams): Promise<MinterInfo> => {
  logWithTimestamp("Minter info: call...");

  const {
    canister: { getMinterInfo },
  } = await ckBTCMinterCanister({ identity, canisterId });

  const result = await getMinterInfo(rest);

  logWithTimestamp("Minter info: done");

  return result;
};

const ckBTCMinterCanister = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<{
  canister: CkBTCMinterCanister;
  agent: Agent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = CkBTCMinterCanister.create({
    agent,
    canisterId,
  });

  return {
    canister,
    agent,
  };
};
