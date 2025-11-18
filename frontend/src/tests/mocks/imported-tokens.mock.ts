import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  indexCanisterIdMock,
  ledgerCanisterIdMock,
} from "$tests/mocks/sns.api.mock";

export const mockImportedToken: ImportedToken = {
  ledger_canister_id: ledgerCanisterIdMock,
  index_canister_id: [indexCanisterIdMock],
};
