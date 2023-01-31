import type { Account } from "$lib/types/account";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { TokenAmount } from "@dfinity/nns";
import { mockPrincipal } from "./auth.store.mock";

export const mockCkBTCMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balance: TokenAmount.fromString({
    amount: "4445566.987",
    token: {
      name: "Test account",
      symbol: "ckBTC",
    },
  }) as TokenAmount,
  principal: mockPrincipal,
  type: "main",
};
