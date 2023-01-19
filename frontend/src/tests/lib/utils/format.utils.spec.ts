import {
  formatNumber,
  formatPercentage,
  shortenWithMiddleEllipsis,
} from "$lib/utils/format.utils";

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

    expect(
      formatNumber(1360290803.9988282, { minFraction: 0, maxFraction: 0 })
    ).toEqual("1’360’290’804");
    expect(
      formatNumber(1360290803.9988282, {
        minFraction: 0,
        maxFraction: 0,
        maximumSignificantDigits: 7,
      })
    ).toEqual("1’360’291’000");
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

  it("should format with ellipsis in the middle", () => {
    expect(shortenWithMiddleEllipsis("123456789")).toEqual("123456789");
    expect(shortenWithMiddleEllipsis("1234567890123456")).toEqual(
      "1234567890123456"
    );
    expect(shortenWithMiddleEllipsis("12345678901234567")).toEqual(
      "1234567...1234567"
    );

    expect(shortenWithMiddleEllipsis("123456789012345678901234")).toEqual(
      "1234567...8901234"
    );
  });

  it("should format with ellipsis in the middle with split custom length", () => {
    expect(shortenWithMiddleEllipsis("123456789", 5)).toEqual("123456789");
    expect(shortenWithMiddleEllipsis("123456789", 2)).toEqual("12...89");
    expect(shortenWithMiddleEllipsis("1234567890123456", 8)).toEqual(
      "1234567890123456"
    );
    expect(shortenWithMiddleEllipsis("1234567890123456", 7)).toEqual(
      "1234567890123456"
    );
    expect(shortenWithMiddleEllipsis("1234567890123456", 6)).toEqual(
      "123456...123456"
    );
  });
});
