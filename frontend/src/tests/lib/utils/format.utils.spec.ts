import {
  formatCurrencyNumber,
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

  describe("formatCurrencyNumber", () => {
    it("formats values less than 1,000 with 2 decimal points", () => {
      expect(formatCurrencyNumber(0)).toBe("$0.00");
      expect(formatCurrencyNumber(0.001)).toBe("$0.00");
      expect(formatCurrencyNumber(0.009)).toBe("$0.01");
      expect(formatCurrencyNumber(1)).toBe("$1.00");
      expect(formatCurrencyNumber(9.9)).toBe("$9.90");
      expect(formatCurrencyNumber(10)).toBe("$10.00");
      expect(formatCurrencyNumber(99.99)).toBe("$99.99");
      expect(formatCurrencyNumber(100)).toBe("$100.00");
      expect(formatCurrencyNumber(420.69)).toBe("$420.69");
      expect(formatCurrencyNumber(999.99)).toBe("$999.99");
    });

    it("formats values between 1,000 and 1,000,000 with 0 decimal points", () => {
      expect(formatCurrencyNumber(1000)).toBe("$1’000");
      expect(formatCurrencyNumber(1000.5)).toBe("$1’001");
      expect(formatCurrencyNumber(1996)).toBe("$1’996");
      expect(formatCurrencyNumber(9999)).toBe("$9’999");
      expect(formatCurrencyNumber(10000)).toBe("$10’000");
      expect(formatCurrencyNumber(100000)).toBe("$100’000");
      expect(formatCurrencyNumber(999999)).toBe("$999’999");
      expect(formatCurrencyNumber(999999.99)).toBe("$1’000’000");
    });

    it("formats values between 1,000,000 and 1,000,000,000 with M suffix and 2 decimal points", () => {
      expect(formatCurrencyNumber(1000000)).toBe("$1.00M");
      expect(formatCurrencyNumber(1500000)).toBe("$1.50M");
      expect(formatCurrencyNumber(1550000)).toBe("$1.55M");
      expect(formatCurrencyNumber(9990000)).toBe("$9.99M");
      expect(formatCurrencyNumber(10000000)).toBe("$10.00M");
      expect(formatCurrencyNumber(24800000)).toBe("$24.80M");
      expect(formatCurrencyNumber(420690000)).toBe("$420.69M");
      expect(formatCurrencyNumber(999999999)).toBe("$1’000.00M");
    });

    it("formats values greater than or equal to 1,000,000,000 with B suffix and 2 decimal points", () => {
      expect(formatCurrencyNumber(1000000000)).toBe("$1.00B");
      expect(formatCurrencyNumber(1500000000)).toBe("$1.50B");
      expect(formatCurrencyNumber(9990000000)).toBe("$9.99B");
      expect(formatCurrencyNumber(10000000000)).toBe("$10.00B");
      expect(formatCurrencyNumber(24800000000)).toBe("$24.80B");
      expect(formatCurrencyNumber(420690000000)).toBe("$420.69B");
      expect(formatCurrencyNumber(999999999999)).toBe("$1’000.00B");
      expect(formatCurrencyNumber(1000000000000)).toBe("$1’000.00B");
    });
  });
});
