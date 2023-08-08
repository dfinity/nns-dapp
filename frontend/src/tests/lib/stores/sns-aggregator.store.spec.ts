import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { aggregatorMockSnsesDataDto } from "$tests/mocks/sns-aggregator.mock";
import { get } from "svelte/store";

describe("sns-aggregator store", () => {
  describe("snsAggregatorStore", () => {
    beforeEach(() => {
      snsAggregatorStore.reset();
    });

    it("should set aggregator data", () => {
      snsAggregatorStore.setData(aggregatorMockSnsesDataDto);

      expect(get(snsAggregatorStore).data).toEqual(aggregatorMockSnsesDataDto);
    });

    it("should reset data", () => {
      snsAggregatorStore.setData(aggregatorMockSnsesDataDto);

      expect(get(snsAggregatorStore).data).toEqual(aggregatorMockSnsesDataDto);

      snsAggregatorStore.reset();
      expect(get(snsAggregatorStore).data).toBeUndefined();
    });

    it("should set data even when data is populated", () => {
      snsAggregatorStore.setData(aggregatorMockSnsesDataDto);

      expect(get(snsAggregatorStore).data).toEqual(aggregatorMockSnsesDataDto);

      snsAggregatorStore.setData([aggregatorMockSnsesDataDto[0]]);
      expect(get(snsAggregatorStore).data).toEqual([
        aggregatorMockSnsesDataDto[0],
      ]);
    });
  });
});
