import {
  executeIcrcTransfer as transferIcrcApi,
  type IcrcTransferParams,
} from "$lib/api/icrc-ledger.api";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { mapOptionalToken } from "$lib/utils/icrc-tokens.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcAccount, IcrcBlockIndex } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";
import { wrapper } from "./sns-wrapper.api";

export const querySnsBalance = async ({
  rootCanisterId,
  identity,
  certified,
  account,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
  account: IcrcAccount;
}): Promise<bigint> => {
  logWithTimestamp("Getting sns balance: call...");

  const { balance: getBalance } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const balance = await getBalance({ ...account });

  logWithTimestamp("Getting sns balance: done");

  return balance;
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

  const metadata = await getMetadata({});

  const token = mapOptionalToken(metadata);

  if (isNullish(token)) {
    throw new LedgerErrorKey("error.icrc_token_load");
  }

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
} & IcrcTransferParams): Promise<IcrcBlockIndex> => {
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
