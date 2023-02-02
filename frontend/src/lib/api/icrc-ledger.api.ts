import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import { mapOptionalToken } from "$lib/utils/icrc-tokens.utils";
import { isNullish } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import type {
  BalanceParams,
  IcrcTokenMetadataResponse,
  IcrcTokens,
} from "@dfinity/ledger";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { TokenAmount } from "@dfinity/nns";
import type { QueryParams } from "@dfinity/utils";

export const getIcrcMainAccount = async ({
  identity,
  certified,
  balance,
  metadata: ledgerMetadata,
}: {
  identity: Identity;
  certified: boolean;
  balance: (params: BalanceParams) => Promise<IcrcTokens>;
  /**
   * TODO: integrate ckBTC fee
   * @deprecated metadata should not be called here and token should not be interpreted per account because it is the same token for all accounts
   */
  metadata: (params: QueryParams) => Promise<IcrcTokenMetadataResponse>;
}): Promise<Account> => {
  const mainAccountIdentifier = { owner: identity.getPrincipal() };

  const [mainBalanceE8s, metadata] = await Promise.all([
    balance({ ...mainAccountIdentifier, certified }),
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
  metadata: ledgerMetadata,
}: {
  certified: boolean;
  metadata: (params: QueryParams) => Promise<IcrcTokenMetadataResponse>;
}): Promise<IcrcTokenMetadata> => {
  const metadata = await ledgerMetadata({ certified });

  const token = mapOptionalToken(metadata);

  if (isNullish(token)) {
    throw new LedgerErrorKey("error.icrc_token_load");
  }

  return token;
};
