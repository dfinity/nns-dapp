import type { Account } from "$lib/types/account";
import { sumTokenAmounts } from "$lib/utils/token.utils";
import type { TokenAmount } from "@dfinity/nns";

export const sumAccounts = (
  accounts: Account[] | undefined
): TokenAmount | undefined =>
  accounts === undefined
    ? undefined
    : sumTokenAmounts(...accounts.map(({ balance }) => balance));
