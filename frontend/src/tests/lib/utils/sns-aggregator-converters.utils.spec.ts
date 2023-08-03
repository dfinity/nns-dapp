import { convertDtoData } from "$lib/utils/sns-aggregator-converters.utils";
import {
  aggregatorSnsMock,
  aggregatorSnsMockDto,
} from "$tests/mocks/sns-aggregator.mock";

describe("sns aggregator converters utils", () => {
  describe("convertDtoData", () => {
    // This might not test much, but it allowed me to catch some mismatch in the types
    it("should convert data", () => {
      const convertedData = convertDtoData([aggregatorSnsMockDto]);
      expect(convertedData).toEqual([aggregatorSnsMock]);
    });
  });
});
