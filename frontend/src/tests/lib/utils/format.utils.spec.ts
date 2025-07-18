import {
  compactCurrencyNumber,
  formatCurrencyNumber,
  formatNumber,
  formatPercentage,
  formatUsdValue,
  renderPrivacyModeBalance,
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
      expect(formatCurrencyNumber(0)).toBe("0.00");
      expect(formatCurrencyNumber(0.001)).toBe("0.00");
      expect(formatCurrencyNumber(0.009)).toBe("0.01");
      expect(formatCurrencyNumber(1)).toBe("1.00");
      expect(formatCurrencyNumber(9.9)).toBe("9.90");
      expect(formatCurrencyNumber(999.99)).toBe("999.99");
    });

    it("formats values between 1,000 and 1,000,000 with 0 decimal points", () => {
      expect(formatCurrencyNumber(1000)).toBe("1’000");
      expect(formatCurrencyNumber(1000.4)).toBe("1’000");
      expect(formatCurrencyNumber(1996.6)).toBe("1’997");
      expect(formatCurrencyNumber(999999)).toBe("999’999");
    });

    it("formats values between 1,000,000 and 1,000,000,000 with M suffix and 2 decimal points", () => {
      expect(formatCurrencyNumber(1000000)).toBe("1.00M");
      expect(formatCurrencyNumber(1550000)).toBe("1.55M");
      expect(formatCurrencyNumber(24800000)).toBe("24.80M");
    });

    it("formats values greater than or equal to 1,000,000,000 with B suffix and 2 decimal points", () => {
      expect(formatCurrencyNumber(1000000000)).toBe("1.00B");
      expect(formatCurrencyNumber(9990000000)).toBe("9.99B");
      expect(formatCurrencyNumber(24800000000)).toBe("24.80B");
    });
  });

  describe("compactCurrencyNumber", () => {
    it("formats values less than 1,000 with 0 decimal points", () => {
      expect(compactCurrencyNumber(0)).toBe("0");
      expect(compactCurrencyNumber(1)).toBe("1");
      expect(compactCurrencyNumber(99)).toBe("99");
      expect(compactCurrencyNumber(123)).toBe("123");
      expect(compactCurrencyNumber(999)).toBe("999");
    });

    it("formats values between 1,000 and 1,000,000 with k suffix and up to 1 decimal point", () => {
      expect(compactCurrencyNumber(1000)).toBe("1k");
      expect(compactCurrencyNumber(1200)).toBe("1.2k");
      expect(compactCurrencyNumber(1500)).toBe("1.5k");
      expect(compactCurrencyNumber(12300)).toBe("12.3k");
      expect(compactCurrencyNumber(123000)).toBe("123k");
      expect(compactCurrencyNumber(123400)).toBe("123.4k");
      expect(compactCurrencyNumber(999900)).toBe("999.9k");
    });

    it("formats values 1,000,000 and above using formatCurrencyNumber logic", () => {
      // These should delegate to formatCurrencyNumber, so they follow its rules
      expect(compactCurrencyNumber(1000000)).toBe("1.00M");
      expect(compactCurrencyNumber(1550000)).toBe("1.55M");
      expect(compactCurrencyNumber(24800000)).toBe("24.80M");
      expect(compactCurrencyNumber(1000000000)).toBe("1.00B");
    });

    it("handles edge cases correctly", () => {
      expect(compactCurrencyNumber(999.9)).toBe("1’000");
      expect(compactCurrencyNumber(999999)).toBe("1’000k");
      expect(compactCurrencyNumber(999999.9)).toBe("1’000k");
    });
  });

  describe("renderPrivacyModeBalance", () => {
    it("returns empty string for 0 count", () => {
      expect(renderPrivacyModeBalance(0)).toBe("");
    });

    it("returns the correct number of bullets ", () => {
      expect(renderPrivacyModeBalance(1)).toBe("•");
      expect(renderPrivacyModeBalance(3)).toBe("•••");
      expect(renderPrivacyModeBalance(5)).toBe("•••••");
    });

    it("returns empty string for negative counts", () => {
      expect(renderPrivacyModeBalance(-1)).toBe("");
    });
  });

  describe("formatUsdValue", () => {
    it("should format zero value", () => {
      expect(formatUsdValue(0)).toEqual("$0.00");
    });

    it("should format almost zero values as < $0.01", () => {
      expect(formatUsdValue(0.001)).toEqual("< $0.01");
      expect(formatUsdValue(0.009)).toEqual("< $0.01");
      expect(formatUsdValue(0.0099)).toEqual("< $0.01");
    });

    it("should format values >= 0.01 normally", () => {
      expect(formatUsdValue(0.01)).toEqual("$0.01");
      expect(formatUsdValue(1.23)).toEqual("$1.23");
      expect(formatUsdValue(123.45)).toEqual("$123.45");
    });
  });
});
