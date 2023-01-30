import { getIcrcMainAccount } from "$lib/api/icrc-ledger.api";
import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Account } from "$lib/types/account";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcAccount } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";
import { arrayOfNumberToUint8Array, toNullable } from "@dfinity/utils";
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

  const { balance, ledgerMetadata } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const mainAccount = await getIcrcMainAccount({
    identity,
    certified,
    balance,
    metadata: ledgerMetadata,
  });

  logWithTimestamp("Getting sns accounts: done");

  return [mainAccount];
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

/**
 * Transfer SNS tokens from one account to another.
 *
 * param.fee is mandatory to ensure that it's show for hardware wallets.
 * Otherwise, the fee would not show in the device and the user would not know how much they are paying.
 *
 * This als adds an extra layer of safety because we show the fee before the user confirms the transaction.
 */
export const transfer = async ({
  identity,
  to,
  e8s,
  rootCanisterId,
  memo,
  fromSubAccount,
  createdAt,
  fee,
}: {
  identity: Identity;
  to: IcrcAccount;
  e8s: bigint;
  rootCanisterId: Principal;
  memo?: Uint8Array;
  fromSubAccount?: SubAccountArray;
  createdAt?: bigint;
  fee: bigint;
}): Promise<void> => {
  const { transfer: transferApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });

  await transferApi({
    amount: e8s,
    to: {
      owner: to.owner,
      subaccount: toNullable(to.subaccount),
    },
    created_at_time: createdAt ?? nowInBigIntNanoSeconds(),
    fee,
    memo,
    from_subaccount:
      fromSubAccount !== undefined
        ? arrayOfNumberToUint8Array(fromSubAccount)
        : undefined,
  });
};
