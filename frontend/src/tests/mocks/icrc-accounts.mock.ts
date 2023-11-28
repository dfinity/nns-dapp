import type { Account } from "$lib/types/account";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { mockPrincipal } from "./auth.store.mock";

export const mockIcrcMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balanceE8s: 890156712340000n,
  principal: mockPrincipal,
  type: "main",
};
