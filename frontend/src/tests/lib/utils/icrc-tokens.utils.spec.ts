import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { get } from "svelte/store";
import { fillTokensStoreFromAggregatorData } from "$lib/utils/icrc-tokens.utils";
import { tokensStore } from "$lib/stores/tokens.store";
import {
  aggregatorMockSnsesDataDto,
  aggregatorSnsMockDto,
  aggregatorSnsMockWith,
  aggregatorTokenMock,
} from "$tests/mocks/sns-aggregator.mock";

describe("ICRC tokens utils", () => {
  beforeEach(() => {
    tokensStore.reset();
  });

  describe("fillTokensStoreFromAggregatorData", () => {
    it("should fill the tokens store with SNS tokens", () => {
      expect(Object.keys(get(tokensStore))).toEqual([
        OWN_CANISTER_ID_TEXT
      ]);
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
      expect(tokensStoreData[aggregatorSnsMockDto.canister_ids.ledger_canister_id].token).toEqual(aggregatorTokenMock);
      expect(tokensStoreData[aggregatorSnsMockDto.canister_ids.root_canister_id].token).toEqual(aggregatorTokenMock);
    });
  });
});
