import type { SnsAccountsStore } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";
import { mockPrincipal } from "./auth.store.mock";

export const mockSnsMainAccount: Account = {
  // TODO: String representation https://dfinity.atlassian.net/browse/GIX-1025
  identifier:
    "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
  balance: TokenAmount.fromString({
    amount: "1234567.8901",
    token: {
      name: "Test",
      symbol: "TST",
    },
  }) as TokenAmount,
  principal: mockPrincipal,
  type: "main",
};

export const mockSnsSubAccount: Account = {
  // TODO: String representation https://dfinity.atlassian.net/browse/GIX-1025
  identifier:
    "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
  balance: TokenAmount.fromString({
    amount: "1234567.8901",
    token: {
      name: "Test",
      symbol: "TST",
    },
  }) as TokenAmount,
  subAccount: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  name: "test subaccount",
  type: "subAccount",
};

const mockSnsAccountsStore = (principal: Principal): SnsAccountsStore => ({
  [principal.toText()]: {
    accounts: [mockSnsMainAccount],
    certified: true,
  },
});

export const mockSnsAccountsStoreSubscribe =
  (principal: Principal = mockPrincipal) =>
  (run: Subscriber<SnsAccountsStore>): (() => void) => {
    run(mockSnsAccountsStore(principal));
    return () => undefined;
  };
