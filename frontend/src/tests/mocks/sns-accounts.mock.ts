import type { SnsAccountsStoreData } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { mockSubAccountArray } from "$tests/mocks/accounts.store.mock";
import { amountFromString } from "$tests/utils/utils.test-utils";
import { encodeIcrcAccount } from "@dfinity/ledger";
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
  balanceE8s: amountFromString("8901567.1234"),
  principal: mockPrincipal,
  type: "main",
};

export const mockSnsSubAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
    subaccount: Uint8Array.from(mockSubAccountArray),
  }),
  balanceE8s: amountFromString("5671234.0189"),
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
