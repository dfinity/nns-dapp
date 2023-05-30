import type { SnsAccountsStoreData } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { mockSubAccountArray } from "$tests/mocks/accounts.store.mock";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";
import { mockPrincipal } from "./auth.store.mock";

export const token: IcrcTokenMetadata = {
  name: "Test",
  symbol: "TST",
} as IcrcTokenMetadata;

export const mockSnsMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balanceE8s: (
    TokenAmount.fromString({
      amount: "8901567.1234",
      token,
    }) as TokenAmount
  ).toE8s(),
  principal: mockPrincipal,
  type: "main",
};

export const mockSnsSubAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
    subaccount: Uint8Array.from(mockSubAccountArray),
  }),
  balanceE8s: (
    TokenAmount.fromString({
      amount: "5671234.0189",
      token,
    }) as TokenAmount
  ).toE8s(),
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
