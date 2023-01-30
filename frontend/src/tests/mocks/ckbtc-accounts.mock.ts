import type { Account } from "$lib/types/account";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { TokenAmount } from "@dfinity/nns";
import { mockPrincipal } from "./auth.store.mock";

const token = {
  name: "Test account",
  symbol: "ckBTC",
};

export const mockCkBTCMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balance: TokenAmount.fromString({
    amount: "4445566.987",
    token,
  }) as TokenAmount,
  principal: mockPrincipal,
  type: "main",
  token,
};
