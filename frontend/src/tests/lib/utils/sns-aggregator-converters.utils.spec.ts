import { convertDtoData } from "$lib/utils/sns-aggregator-converters.utils";
import {
  aggregatorSnsMock,
  aggregatorSnsMockDto,
} from "$tests/mocks/sns-aggregator.mock";

describe("sns aggregator converters utils", () => {
  it("converts aggregator types to ic-js types", () => {
    expect(convertDtoData([aggregatorSnsMockDto])).toEqual([aggregatorSnsMock]);
  });
});
