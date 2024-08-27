import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import {
  fromImportedTokenData,
  isImportedToken,
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

  describe("isImportedToken", () => {
    it("should return true when in the list", () => {
      expect(
        isImportedToken({
          ledgerCanisterId: principal(1),
          importedTokens: [
            {
              ledgerCanisterId: principal(0),
            } as ImportedTokenData,
            {
              ledgerCanisterId: principal(1),
            } as ImportedTokenData,
          ],
        })
      ).toEqual(true);
    });

    it("should return false when not in the list", () => {
      expect(
        isImportedToken({
          ledgerCanisterId: principal(1),
          importedTokens: [
            {
              ledgerCanisterId: principal(0),
            } as ImportedTokenData,
          ],
        })
      ).toEqual(false);
    });

    it("should return false when not enough information", () => {
      expect(
        isImportedToken({
          ledgerCanisterId: undefined,
          importedTokens: [
            {
              ledgerCanisterId: principal(0),
            } as ImportedTokenData,
          ],
        })
      ).toEqual(false);
      expect(
        isImportedToken({
          ledgerCanisterId: principal(0),
          importedTokens: undefined,
        })
      ).toEqual(false);
      expect(
        isImportedToken({
          ledgerCanisterId: undefined,
          importedTokens: undefined,
        })
      ).toEqual(false);
    });
  });
});
