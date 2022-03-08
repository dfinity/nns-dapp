import { formatNumber } from "../../../lib/utils/format.utils";

describe("format.utils", () => {
  it("should format number", () => {
    expect(formatNumber(0, { minFraction: 0, maxFraction: 0 })).toEqual("0");

    expect(formatNumber(0)).toEqual("0.00");

    expect(formatNumber(123456789, { minFraction: 0, maxFraction: 0 })).toEqual(
      "123’456’789"
    );

    expect(formatNumber(0.123456789)).toEqual("0.12");

    expect(
      formatNumber(0.123456789, { minFraction: 0, maxFraction: 5 })
    ).toEqual("0.12346");

    expect(
      formatNumber(0.123456789, { minFraction: 3, maxFraction: 3 })
    ).toEqual("0.123");
  });
});
