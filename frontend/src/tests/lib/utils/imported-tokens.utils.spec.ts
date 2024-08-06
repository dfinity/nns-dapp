import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import {
  fromImportedTokenData,
  toImportedTokenData,
} from "$lib/utils/imported-tokens.utils";
import { principal } from "$tests/mocks/sns-projects.mock";

describe("imported tokens utils", () => {
  const importedToken: ImportedToken = {
    ledger_canister_id: principal(0),
    index_canister_id: [principal(1)],
  };
  const importedTokenData: ImportedTokenData = {
    ledgerCanisterId: principal(0),
    indexCanisterId: principal(1),
  };
  const importedTokenWithoutIndex: ImportedToken = {
    ledger_canister_id: principal(2),
    index_canister_id: [],
  };
  const importedTokenDataWithoutIndex: ImportedTokenData = {
    ledgerCanisterId: principal(2),
    indexCanisterId: undefined,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("toImportedTokenData", () => {
    it("should convert imported token", () => {
      expect(toImportedTokenData(importedToken)).toEqual(importedTokenData);
    });

    it("should convert imported token without index canister", () => {
      expect(toImportedTokenData(importedTokenWithoutIndex)).toEqual(
        importedTokenDataWithoutIndex
      );
    });
  });

  describe("fromImportedTokenData", () => {
    it("should convert imported token", () => {
      expect(fromImportedTokenData(importedTokenData)).toEqual(importedToken);
    });

    it("should convert imported token without index canister", () => {
      expect(fromImportedTokenData(importedTokenDataWithoutIndex)).toEqual(
        importedTokenWithoutIndex
      );
    });
  });
});
