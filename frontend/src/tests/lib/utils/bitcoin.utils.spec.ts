import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";

describe("bitcoin.utils", () => {
  it("should format bitcoin estimated fee", () => {
    expect(formatEstimatedFee(10n)).toEqual("0.0000001");
    expect(formatEstimatedFee(1083n)).toEqual("0.00001083");
    expect(formatEstimatedFee(108310831083n)).toEqual("1'083.10831083");
  });
});
