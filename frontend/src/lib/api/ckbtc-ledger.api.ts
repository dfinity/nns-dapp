import { createAgent } from "$lib/api/agent.api";
import {
  getIcrcMainAccount,
  getIcrcToken,
  icrcTransfer as transferIcrcApi,
  type IcrcTransferParams,
} from "$lib/api/icrc-ledger.api";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import { IcrcLedgerCanister } from "@dfinity/ledger";

export const getCkBTCAccounts = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<Account[]> => {
  // TODO: Support subaccounts
  logWithTimestamp("Getting ckBTC accounts: call...");

  const {
    canister: { metadata, balance },
  } = await ckBTCLedgerCanister({ identity });

  const mainAccount = await getIcrcMainAccount({
    identity,
    certified,
    getBalance: balance,
    getMetadata: metadata,
  });

  logWithTimestamp("Getting ckBTC accounts: done");

  return [mainAccount];
};

export const getCkBTCToken = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<IcrcTokenMetadata> => {
  logWithTimestamp("Getting ckBTC token: call...");

  const {
    canister: { metadata: getMetadata },
  } = await ckBTCLedgerCanister({ identity });

  const token = await getIcrcToken({
    certified,
    getMetadata,
  });

  logWithTimestamp("Getting ckBTC token: done");

  return token;
};

export const ckBTCTransfer = async ({
  identity,
  ...rest
}: {
  identity: Identity;
} & Omit<IcrcTransferParams, "transfer">): Promise<void> => {
  logWithTimestamp("Getting ckBTC transfer: call...");

  const {
    canister: { transfer: transferApi },
  } = await ckBTCLedgerCanister({ identity });

  await transferIcrcApi({
    ...rest,
    transfer: transferApi,
  });

  logWithTimestamp("Getting ckBTC transfer: done");
};

const ckBTCLedgerCanister = async ({
  identity,
}: {
  identity: Identity;
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
    canisterId: CKBTC_LEDGER_CANISTER_ID,
  });

  return {
    canister,
    agent,
  };
};
