import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { TokenAmount } from "@dfinity/nns";
import { mockPrincipal } from "./auth.store.mock";

export const mockCkBTCToken: IcrcTokenMetadata = {
  name: "Test account",
  symbol: "ckBTC",
  fee: BigInt(1),
};

export const mockCkBTCMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balance: TokenAmount.fromString({
    amount: "4445566.987",
    token: mockCkBTCToken,
  }) as TokenAmount,
  principal: mockPrincipal,
  type: "main",
};

export const mockCkBTCAddress = "73avq-yvrvj-kuzxq-kttlj-nkaz4-tecy6-biuud-3ymeg-guvci-naire-uqe";
export const mockBTCAddressTestnet = "mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn";
export const mockBTCAddressMainnet = "17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem";
