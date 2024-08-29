import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { tokensStore } from "$lib/stores/tokens.store";
import {
  fillTokensStoreFromAggregatorData,
  isImportantCkToken,
} from "$lib/utils/icrc-tokens.utils";
import {
  aggregatorSnsMockDto,
  aggregatorTokenMock,
} from "$tests/mocks/sns-aggregator.mock";
import { get } from "svelte/store";
import { CKBTC_LEDGER_CANISTER_ID } from "../../../lib/constants/ckbtc-canister-ids.constants";
import { CKETH_LEDGER_CANISTER_ID } from "../../../lib/constants/cketh-canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "../../../lib/constants/ckusdc-canister-ids.constants";
import { principal } from "../../mocks/sns-projects.mock";

describe("ICRC tokens utils", () => {
  beforeEach(() => {
    tokensStore.reset();
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
    });
  });
});
