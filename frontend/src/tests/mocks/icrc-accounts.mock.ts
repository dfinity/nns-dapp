import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Account } from "$lib/types/account";
import {
  indexCanisterIdMock,
  ledgerCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { mockPrincipal } from "./auth.store.mock";

export const mockIcrcMainAccount: Account = {
  identifier: encodeIcrcAccount({
    owner: mockPrincipal,
  }),
  balanceUlps: 890156712340000n,
  principal: mockPrincipal,
  type: "main",
};

export const mockImportedToken: ImportedToken = {
  ledger_canister_id: ledgerCanisterIdMock,
  index_canister_id: [indexCanisterIdMock],
};
