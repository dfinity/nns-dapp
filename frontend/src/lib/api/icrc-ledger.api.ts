import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { mapOptionalToken } from "$lib/utils/icrc-tokens.utils";
import type { Identity } from "@dfinity/agent";
import type {
  BalanceParams,
  IcrcTokenMetadataResponse,
  IcrcTokens,
} from "@dfinity/ledger";
import {
  encodeIcrcAccount,
  type IcrcAccount,
  type IcrcBlockIndex,
  type TransferParams,
} from "@dfinity/ledger";
import { TokenAmount } from "@dfinity/nns";
import type { QueryParams } from "@dfinity/utils";
import {
  arrayOfNumberToUint8Array,
  isNullish,
  nonNullish,
  toNullable,
} from "@dfinity/utils";

export const getIcrcMainAccount = async ({
  identity,
  certified,
  getBalance,
  getMetadata: ledgerMetadata,
}: {
  identity: Identity;
  certified: boolean;
  getBalance: (params: BalanceParams) => Promise<IcrcTokens>;
  /**
   * TODO: integrate ckBTC fee
   * @deprecated metadata should not be called here and token should not be interpreted per account because it is the same token for all accounts
   */
  getMetadata: (params: QueryParams) => Promise<IcrcTokenMetadataResponse>;
}): Promise<Account> => {
  const mainAccountIdentifier = { owner: identity.getPrincipal() };

  const [mainBalanceE8s, metadata] = await Promise.all([
    getBalance({ ...mainAccountIdentifier, certified }),
    ledgerMetadata({ certified }),
  ]);

  const projectToken = mapOptionalToken(metadata);

  if (projectToken === undefined) {
    throw new LedgerErrorKey("error.icrc_token_load");
  }

  return {
    identifier: encodeIcrcAccount(mainAccountIdentifier),
    principal: identity.getPrincipal(),
    balance: TokenAmount.fromE8s({
      amount: mainBalanceE8s,
      token: projectToken,
    }),
    type: "main",
  };
};

export const getIcrcToken = async ({
  certified,
  getMetadata,
}: {
  certified: boolean;
  getMetadata: (params: QueryParams) => Promise<IcrcTokenMetadataResponse>;
}): Promise<IcrcTokenMetadata> => {
  const metadata = await getMetadata({ certified });

  const token = mapOptionalToken(metadata);

  if (isNullish(token)) {
    throw new LedgerErrorKey("error.icrc_token_load");
  }

  return token;
};

export interface IcrcTransferParams {
  to: IcrcAccount;
  amount: bigint;
  memo?: Uint8Array;
  fromSubAccount?: SubAccountArray;
  createdAt?: bigint;
  fee: bigint;
  transfer: (params: TransferParams) => Promise<IcrcBlockIndex>;
}

/**
 * Transfer Icrc tokens from one account to another.
 *
 * param.fee is mandatory to ensure that it's show for hardware wallets.
 * Otherwise, the fee would not show in the device and the user would not know how much they are paying.
 *
 * This als adds an extra layer of safety because we show the fee before the user confirms the transaction.
 */
export const icrcTransfer = async ({
  to: { owner, subaccount },
  fromSubAccount,
  createdAt,
  transfer: transferApi,
  ...rest
}: IcrcTransferParams): Promise<void> => {
  await transferApi({
    to: {
      owner,
      subaccount: toNullable(subaccount),
    },
    created_at_time: createdAt ?? nowInBigIntNanoSeconds(),
    from_subaccount: nonNullish(fromSubAccount)
      ? arrayOfNumberToUint8Array(fromSubAccount)
      : undefined,
    ...rest,
  });
};
