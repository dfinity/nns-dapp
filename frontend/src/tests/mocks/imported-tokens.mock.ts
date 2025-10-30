import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { indexCanisterIdMock, ledgerCanisterIdMock } from "./sns.api.mock";

export const mockImportedToken: ImportedToken = {
  ledger_canister_id: ledgerCanisterIdMock,
  index_canister_id: [indexCanisterIdMock],
};
