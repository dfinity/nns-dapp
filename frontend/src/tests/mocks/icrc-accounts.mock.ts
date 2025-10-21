import type {
  FavProject,
  ImportedToken,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Account } from "$lib/types/account";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  indexCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";

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

export const mockFavProject: FavProject = {
  root_canister_id: rootCanisterIdMock,
};
