import type {
  FavProject,
  ImportedToken,
  NamedAddress,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Account } from "$lib/types/account";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  indexCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";

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

export const mockNamedAddress: NamedAddress = {
  name: "Alice",
  address: {
    Icp: "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
  },
};

export const mockNamedAddressIcrc1: NamedAddress = {
  name: "Bob",
  address: {
    Icrc1: "h4a5i-5vcfo-5rusv-fmb6m-vrkia-mjnkc-jpoow-h5mam-nthnm-ldqlr-bqe",
  },
};
