import type { SnsAccountsStoreData } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { mockSubAccountArray } from "$tests/mocks/accounts.store.mock";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";
import { mockPrincipal } from "./auth.store.mock";

export const mockSnsMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balance: TokenAmount.fromString({
    amount: "8901567.1234",
    token: {
      name: "Test",
      symbol: "TST",
    },
  }) as TokenAmount,
  principal: mockPrincipal,
  type: "main",
};

export const mockSnsSubAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
    subaccount: Uint8Array.from(mockSubAccountArray),
  }),
  balance: TokenAmount.fromString({
    amount: "5671234.0189",
    token: {
      name: "Test",
      symbol: "TST",
    },
  }) as TokenAmount,
  subAccount: mockSubAccountArray,
  name: "test subaccount",
  type: "subAccount",
};

const mockSnsAccountsStore = (principal: Principal): SnsAccountsStoreData => ({
  [principal.toText()]: {
    accounts: [mockSnsMainAccount],
    certified: true,
  },
});

export const mockSnsAccountsStoreSubscribe =
  (principal: Principal = mockPrincipal) =>
  (run: Subscriber<SnsAccountsStoreData>): (() => void) => {
    run(mockSnsAccountsStore(principal));
    return () => undefined;
  };
