import type { Account } from "$lib/types/account";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import { mapIcrcTokenMetadata } from "$lib/utils/icrc.utils";
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
  metadata: (params: QueryParams) => Promise<IcrcTokenMetadataResponse>;
}): Promise<Account> => {
  const mainAccountIdentifier = { owner: identity.getPrincipal() };

  const [mainBalanceE8s, metadata] = await Promise.all([
    balance({ ...mainAccountIdentifier, certified }),
    ledgerMetadata({ certified }),
  ]);

  const token = mapIcrcTokenMetadata(metadata);

  if (isNullish(token)) {
    throw new LedgerErrorKey("error.icrc_token_load");
  }

  return {
    identifier: encodeIcrcAccount(mainAccountIdentifier),
    principal: identity.getPrincipal(),
    balance: TokenAmount.fromE8s({
      amount: mainBalanceE8s,
      token,
    }),
    type: "main",
    token,
  };
};
