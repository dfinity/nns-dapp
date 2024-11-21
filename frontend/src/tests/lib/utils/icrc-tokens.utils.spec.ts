import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import {
  CKBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_LEDGER_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_LEDGER_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { tokensStore } from "$lib/stores/tokens.store";
import {
  fillTokensStoreFromAggregatorData,
  isImportantCkToken,
  mapOptionalToken,
} from "$lib/utils/icrc-tokens.utils";
import {
  aggregatorSnsMockDto,
  aggregatorTokenMock,
} from "$tests/mocks/sns-aggregator.mock";
import {
  mockQueryTokenResponse,
  mockSnsToken,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { IcrcMetadataResponseEntries } from "@dfinity/ledger-icrc";
import { get } from "svelte/store";

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

  describe("fillTokensStoreFromAggregatorData", () => {
    it("should fill the tokens store with SNS tokens", () => {
      expect(Object.keys(get(tokensStore))).toEqual([OWN_CANISTER_ID_TEXT]);
      fillTokensStoreFromAggregatorData({
        tokensStore,
        aggregatorData: [aggregatorSnsMockDto],
      });
      const tokensStoreData = get(tokensStore);

      expect(Object.keys(tokensStoreData)).toEqual([
        OWN_CANISTER_ID_TEXT,
        aggregatorSnsMockDto.canister_ids.root_canister_id,
        aggregatorSnsMockDto.canister_ids.ledger_canister_id,
      ]);
      expect(
        tokensStoreData[aggregatorSnsMockDto.canister_ids.ledger_canister_id]
          .token
      ).toEqual(aggregatorTokenMock);
      expect(
        tokensStoreData[aggregatorSnsMockDto.canister_ids.root_canister_id]
          .token
      ).toEqual(aggregatorTokenMock);
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
