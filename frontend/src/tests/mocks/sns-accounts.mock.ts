import type { SnsAccountsStoreData } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { mockSubAccountArray } from "$tests/mocks/icp-accounts.store.mock";
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
  balanceE8s: 890156712340000n,
  principal: mockPrincipal,
  type: "main",
};

export const mockSnsSubAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
    subaccount: Uint8Array.from(mockSubAccountArray),
  }),
  balanceE8s: 567123401890000n,
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
