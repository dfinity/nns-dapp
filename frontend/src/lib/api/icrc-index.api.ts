import { createAgent } from "$lib/api/agent.api";
import { HOST } from "$lib/constants/environment.constants";
import type { Agent, Identity } from "@dfinity/agent";
import {
  IcrcIndexCanister,
  IcrcIndexNgCanister,
  type IcrcAccount,
  type IcrcGetTransactions,
} from "@dfinity/ledger-icrc";
import type { SubAccount } from "@dfinity/ledger-icrc/dist/candid/icrc_index";
import { Principal } from "@dfinity/principal";
import { fromNullable } from "@dfinity/utils";

export interface GetTransactionsParams {
  identity: Identity;
  account: IcrcAccount;
  start?: bigint;
  maxResults: bigint;
  indexCanisterId: Principal;
}

export interface GetTransactionsResponse
  extends Omit<IcrcGetTransactions, "oldest_tx_id"> {
  oldestTxId?: bigint;
}

export const getTransactions = async ({
  identity,
  indexCanisterId,
  maxResults,
  start,
  account,
}: GetTransactionsParams): Promise<GetTransactionsResponse> => {
  const {
    canister: { getTransactions },
  } = await indexCanister({ identity, canisterId: indexCanisterId });

  const { oldest_tx_id, ...rest } = await getTransactions({
    max_results: maxResults,
    start,
    account,
  });

  return {
    oldestTxId: fromNullable(oldest_tx_id),
    ...rest,
  };
};

// TODO(yhabib): Migrate all methods to the indexNgCanister
const indexCanister = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<{
  canister: IcrcIndexCanister;
  agent: Agent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = IcrcIndexCanister.create({
    agent,
    canisterId,
  });

  return {
    canister,
    agent,
  };
};

export const getLedgerId = async ({
  identity,
  indexCanisterId,
  certified,
}: {
  identity: Identity;
  indexCanisterId: Principal;
  certified?: boolean;
}): Promise<Principal> => {
  const {
    canister: { ledgerId },
  } = await indexNgCanister({ identity, canisterId: indexCanisterId });

  return ledgerId({ certified });
};

export const listSubaccounts = async ({
  identity,
  indexCanisterId,
  certified,
}: {
  identity: Identity;
  indexCanisterId: Principal;
  certified?: boolean;
}): Promise<Array<SubAccount>> => {
  const {
    canister: { listSubaccounts },
  } = await indexNgCanister({
    identity,
    canisterId: indexCanisterId,
  });

  const owner = identity.getPrincipal();
  const subaccounts = await listSubaccounts({
    owner,
    certified,
  });

  return subaccounts;
};

const indexNgCanister = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<{
  canister: IcrcIndexNgCanister;
  agent: Agent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = IcrcIndexNgCanister.create({
    agent,
    canisterId,
  });

  return {
    canister,
    agent,
  };
};
