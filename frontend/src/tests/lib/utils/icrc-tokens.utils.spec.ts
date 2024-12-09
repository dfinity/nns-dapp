import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_LEDGER_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_LEDGER_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import {
  isImportantCkToken,
  mapOptionalToken,
} from "$lib/utils/icrc-tokens.utils";
import {
  mockQueryTokenResponse,
  mockSnsToken,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { IcrcMetadataResponseEntries } from "@dfinity/ledger-icrc";

describe("ICRC tokens utils", () => {
  describe("mapOptionalToken", () => {
    it("should return token", () => {
      const token = mapOptionalToken(mockQueryTokenResponse);
      expect(token?.name).toBeDefined();
      expect(token?.symbol).toBeDefined();
      expect(token?.fee).toBeDefined();
    });

    it("should not return token if name is missing", () => {
      const token = mapOptionalToken(
        mockQueryTokenResponse.filter(
          ([key]) => key !== IcrcMetadataResponseEntries.NAME
        )
      );
      expect(token).toBeUndefined();
    });

    it("should not return token if symbol is missing", () => {
      const token = mapOptionalToken(
        mockQueryTokenResponse.filter(
          ([key]) => key !== IcrcMetadataResponseEntries.SYMBOL
        )
      );
      expect(token).toBeUndefined();
    });

    it("should not return token if fee is missing", () => {
      const token = mapOptionalToken(
        mockQueryTokenResponse.filter(
          ([key]) => key !== IcrcMetadataResponseEntries.FEE
        )
      );
      expect(token).toBeUndefined();
    });

    it("should return token with decimals and logo", () => {
      const logo = "data:image/svg+xml;base64...";
      const token = mapOptionalToken([
        ...mockQueryTokenResponse,
        [IcrcMetadataResponseEntries.LOGO, { Text: logo }],
      ]);
      expect(token).toEqual({
        ...mockSnsToken,
        decimals: 8,
        logo,
      });
    });
  });

  describe("isImportantCkToken", () => {
    it("should return true for important token ledger canisters", () => {
      expect(
        isImportantCkToken({ ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID })
      ).toEqual(true);
      expect(
        isImportantCkToken({ ledgerCanisterId: CKETH_LEDGER_CANISTER_ID })
      ).toEqual(true);
      expect(
        isImportantCkToken({ ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID })
      ).toEqual(true);
      expect(
        isImportantCkToken({ ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID })
      ).toEqual(true);
    });

    it("should return false for not important token ledger canisters", () => {
      expect(isImportantCkToken({ ledgerCanisterId: principal(0) })).toEqual(
        false
      );
      expect(isImportantCkToken({ ledgerCanisterId: OWN_CANISTER_ID })).toEqual(
        false
      );
      expect(
        isImportantCkToken({ ledgerCanisterId: CKTESTBTC_LEDGER_CANISTER_ID })
      ).toEqual(false);
    });
  });
});
