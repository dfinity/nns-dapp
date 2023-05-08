import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";

describe("bitcoin.utils", () => {
  it("should format bitcoin estimated fee", () => {
    expect(formatEstimatedFee(1083n)).toEqual("0.00001083");
    expect(formatEstimatedFee(108310831083n)).toEqual("1083.10831083");
  });
});
