import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { mockSubAccountArray } from "$tests/mocks/icp-accounts.store.mock";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";

export const token: IcrcTokenMetadata = {
  name: "Test",
  symbol: "TST",
} as IcrcTokenMetadata;

export const mockSnsMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balanceUlps: 890156712340000n,
  principal: mockPrincipal,
  type: "main",
};

export const mockSnsSubAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
    subaccount: Uint8Array.from(mockSubAccountArray),
  }),
  balanceUlps: 567123401890000n,
  subAccount: mockSubAccountArray,
  name: "test subaccount",
  type: "subAccount",
};
