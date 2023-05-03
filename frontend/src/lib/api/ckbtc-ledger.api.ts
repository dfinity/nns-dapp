import { createAgent } from "$lib/api/agent.api";
import {
  getIcrcAccount,
  getIcrcToken,
  icrcTransfer as transferIcrcApi,
  type IcrcTransferParams,
} from "$lib/api/icrc-ledger.api";
import { HOST } from "$lib/constants/environment.constants";
import type { Account, AccountType } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  IcrcLedgerCanister,
  type IcrcAccount,
  type IcrcBlockIndex,
} from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";

export const getCkBTCAccount = async ({
  identity,
  certified,
  canisterId,
  ...rest
}: {
  identity: Identity;
  certified: boolean;
  canisterId: Principal;
  type: AccountType;
} & IcrcAccount): Promise<Account> => {
  logWithTimestamp("Getting ckBTC account: call...");

  const {
    canister: { metadata, balance },
  } = await ckBTCLedgerCanister({ identity, canisterId });

  const callParams = {
    certified,
    getBalance: balance,
    getMetadata: metadata,
  };

  const account = await getIcrcAccount({
    ...rest,
    ...callParams,
  });

  logWithTimestamp("Getting ckBTC account: done");

  return account;
};

export const getCkBTCToken = async ({
  identity,
  certified,
  canisterId,
}: {
  identity: Identity;
  certified: boolean;
  canisterId: Principal;
}): Promise<IcrcTokenMetadata> => {
  logWithTimestamp("Getting ckBTC token: call...");

  const {
    canister: { metadata: getMetadata },
  } = await ckBTCLedgerCanister({ identity, canisterId });

  const token = await getIcrcToken({
    certified,
    getMetadata,
  });

  logWithTimestamp("Getting ckBTC token: done");

  return token;
};

export const ckBTCTransfer = async ({
  identity,
  canisterId,
  ...rest
}: {
  identity: Identity;
  canisterId: Principal;
} & Omit<IcrcTransferParams, "transfer">): Promise<IcrcBlockIndex> => {
  logWithTimestamp("Getting ckBTC transfer: call...");

  const {
    canister: { transfer: transferApi },
  } = await ckBTCLedgerCanister({ identity, canisterId });

  const blockIndex = await transferIcrcApi({
    ...rest,
    transfer: transferApi,
  });

  logWithTimestamp("Getting ckBTC transfer: done");

  return blockIndex;
};

const ckBTCLedgerCanister = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<{
  canister: IcrcLedgerCanister;
  agent: HttpAgent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = IcrcLedgerCanister.create({
    agent,
    canisterId,
  });

  return {
    canister,
    agent,
  };
};
