import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Account } from "$lib/types/account";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { mapOptionalToken } from "$lib/utils/sns.utils";
import type { Identity } from "@dfinity/agent";
import { encodeIcrcAccount, type IcrcAccount } from "@dfinity/ledger";
import { TokenAmount } from "@dfinity/nns";
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

  const snsMainAccount = { owner: identity.getPrincipal() };
  const [mainBalanceE8s, metadata] = await Promise.all([
    balance(snsMainAccount),
    ledgerMetadata({}),
  ]);

  const projectToken = mapOptionalToken(metadata);

  if (projectToken === undefined) {
    throw new LedgerErrorKey("error.sns_token_load");
  }

  const mainAccount: Account = {
    identifier: encodeIcrcAccount(snsMainAccount),
    principal: identity.getPrincipal(),
    balance: TokenAmount.fromE8s({
      amount: mainBalanceE8s,
      token: projectToken,
    }),
    type: "main",
  };

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

export const transfer = async ({
  identity,
  to,
  e8s,
  rootCanisterId,
  memo,
  fromSubAccount,
  createdAt,
}: {
  identity: Identity;
  to: IcrcAccount;
  e8s: bigint;
  rootCanisterId: Principal;
  memo?: Uint8Array;
  fromSubAccount?: SubAccountArray;
  createdAt?: bigint;
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
    memo,
    from_subaccount:
      fromSubAccount !== undefined
        ? arrayOfNumberToUint8Array(fromSubAccount)
        : undefined,
  });
};
