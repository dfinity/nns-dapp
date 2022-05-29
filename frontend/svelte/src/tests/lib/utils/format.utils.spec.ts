import {
  formatNumber,
  formatPercentage,
} from "../../../lib/utils/format.utils";

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

  it("should format percentage", () => {
    expect(formatPercentage(0)).toEqual("0.000%");

    expect(formatPercentage(1234567.89)).toEqual("123’456’789.000%");

    expect(formatPercentage(0.1239)).toEqual("12.390%");

    expect(formatPercentage(1.1239)).toEqual("112.390%");

    expect(formatPercentage(0.123456789)).toEqual("12.346%");

    expect(
      formatPercentage(0.123456789, { minFraction: 2, maxFraction: 4 })
    ).toEqual("12.3457%");

    expect(formatPercentage(0.123, { minFraction: 2, maxFraction: 4 })).toEqual(
      "12.30%"
    );

    expect(formatPercentage(0.123, { minFraction: 0, maxFraction: 0 })).toEqual(
      "12%"
    );
  });
});
