import {
  getIcrcAccount,
  getIcrcToken,
  icrcTransfer as transferIcrcApi,
  type IcrcTransferParams,
} from "$lib/api/icrc-ledger.api";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcBlockIndex } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";
import { wrapper } from "./sns-wrapper.api";

export const getSnsAccounts = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<Account[]> => {
  // TODO: Support subaccounts
  logWithTimestamp("Getting sns accounts: call...");

  const { balance: getBalance, ledgerMetadata: getMetadata } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const mainAccount = await getIcrcAccount({
    owner: identity.getPrincipal(),
    type: "main",
    certified,
    getBalance,
    getMetadata,
  });

  logWithTimestamp("Getting sns accounts: done");

  return [mainAccount];
};

export const getSnsToken = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<IcrcTokenMetadata> => {
  logWithTimestamp("Getting sns token: call...");

  const { ledgerMetadata: getMetadata } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const token = await getIcrcToken({
    certified,
    getMetadata,
  });

  logWithTimestamp("Getting sns token: done");

  return token;
};

export const transactionFee = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<bigint> => {
  logWithTimestamp("Getting sns transaction fee: call...");
  const { transactionFee: transactionFeeApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const fee = await transactionFeeApi({ certified });

  logWithTimestamp("Getting sns transaction fee: done");
  return fee;
};

export const snsTransfer = async ({
  identity,
  rootCanisterId,
  ...rest
}: {
  identity: Identity;
  rootCanisterId: Principal;
} & Omit<IcrcTransferParams, "transfer">): Promise<IcrcBlockIndex> => {
  logWithTimestamp("Getting Sns transfer: call...");

  const { transfer: transferApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  const blockIndex = await transferIcrcApi({
    ...rest,
    transfer: transferApi,
  });

  logWithTimestamp("Getting Sns transfer: done");

  return blockIndex;
};
