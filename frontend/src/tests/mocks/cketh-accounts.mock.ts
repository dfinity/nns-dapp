import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";

export const mockCkETHToken: IcrcTokenMetadata = {
  name: "ckETH",
  symbol: "ckETH",
  fee: 10_000n,
  decimals: 18n,
};

export const mockCkETHTESTToken: IcrcTokenMetadata = {
  symbol: "ckETHTEST",
  name: "ckETHTEST",
  fee: 10_000n,
  decimals: 18n,
};

export const mockCkETHMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balanceE8s: 1111222233334444n,
  principal: mockPrincipal,
  type: "main",
};
