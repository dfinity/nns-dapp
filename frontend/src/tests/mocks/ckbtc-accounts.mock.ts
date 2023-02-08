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

export const mockCkBTCAddress = "bcrt1qu2aqme90t6hpac50x0xw8ljwqs250vn6tzlmsv";
