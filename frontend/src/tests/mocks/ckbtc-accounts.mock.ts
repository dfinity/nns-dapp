import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { decodeIcrcAccount, encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { mockPrincipal } from "./auth.store.mock";

export const mockCkBTCToken: IcrcTokenMetadata = {
  name: "Test account",
  symbol: "ckBTC",
  fee: BigInt(1),
  decimals: 8,
};

export const mockCkTESTBTCToken = {
  ...mockCkBTCToken,
  symbol: "ckTESTBTC",
  name: "ckTESTBTC",
  decimals: 8,
};

export const mockCkBTCMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balanceUlps: 444556698700000n,
  principal: mockPrincipal,
  type: "main",
};

export const mockCkBTCWithdrawalIdentifier =
  "st75y-vaaaa-aaaaa-aaalq-cai-7jrzqui.7716a6628200d2a01721e2955bd60c881f92c89b7bc81092f55868ea56169473";
export const mockCkBTCWithdrawalIcrcAccount = decodeIcrcAccount(
  mockCkBTCWithdrawalIdentifier
);

export const mockCkBTCWithdrawalAccount: Account = {
  identifier: mockCkBTCWithdrawalIdentifier,
  balanceUlps: 98711100000n,
  principal: mockCkBTCWithdrawalIcrcAccount.owner,
  type: "withdrawalAccount",
};

export const mockCkBTCAddress =
  "73avq-yvrvj-kuzxq-kttlj-nkaz4-tecy6-biuud-3ymeg-guvci-naire-uqe";
export const mockBTCAddressTestnet = "mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn";
export const mockBTCAddressMainnet = "17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem";
