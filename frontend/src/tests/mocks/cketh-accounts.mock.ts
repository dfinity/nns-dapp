import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {Account} from "$lib/types/account";
import {encodeIcrcAccount} from "@dfinity/ledger-icrc";
import {mockPrincipal} from "$tests/mocks/auth.store.mock";

export const mockCkETHToken: IcrcTokenMetadata = {
  name: "ckETH",
  symbol: "ckETH",
  fee: 10_000n,
};

export const mockCkETHTESTToken: IcrcTokenMetadata = {
  symbol: "ckETHTEST",
  name: "ckETHTEST",
  fee: 10_000n,
};

export const mockCkETHMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balanceE8s: 1111222233334444n,
  principal: mockPrincipal,
  type: "main",
};