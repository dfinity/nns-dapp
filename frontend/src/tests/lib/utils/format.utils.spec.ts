import {
  firstAndLastDigits,
  firstAndLastDigitsWithMiddleHellip,
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

  it("should return first and last digits", () => {
    expect(firstAndLastDigits("123456789")).toEqual(["123456789", ""]);
    expect(firstAndLastDigits("12345678901234567")).toEqual([
      "1234567",
      "1234567",
    ]);
    expect(firstAndLastDigits("123456789012345678901234")).toEqual([
      "1234567",
      "8901234",
    ]);
  });

  it("should return first and last digits with custom split length", () => {
    expect(firstAndLastDigits("123456789", 2)).toEqual(["12", "89"]);
    expect(firstAndLastDigits("1234567890123456", 6)).toEqual([
      "123456",
      "123456",
    ]);
    expect(firstAndLastDigits("1234567890123456", 5)).toEqual([
      "12345",
      "23456",
    ]);
  });

  it("should return only first part when string is shorter than split length", () => {
    expect(firstAndLastDigits("123", 5)).toEqual(["123", ""]);
    expect(firstAndLastDigits("12345", 5)).toEqual(["12345", ""]);
    expect(firstAndLastDigits("123456", 5)).toEqual(["123456", ""]);
  });

  it("should handle edge cases", () => {
    expect(firstAndLastDigits("", 5)).toEqual(["", ""]);
    expect(firstAndLastDigits("a", 5)).toEqual(["a", ""]);
    expect(firstAndLastDigits("ab", 1)).toEqual(["ab", ""]);
  });

  it("should return string with ellipsis in the middle", () => {
    expect(firstAndLastDigitsWithMiddleHellip("123456789")).toEqual(
      "123456789"
    );
    expect(firstAndLastDigitsWithMiddleHellip("1234567890123456")).toEqual(
      "1234567890123456"
    );
    expect(firstAndLastDigitsWithMiddleHellip("12345678901234567")).toEqual(
      "1234567…1234567"
    );
    expect(
      firstAndLastDigitsWithMiddleHellip("123456789012345678901234")
    ).toEqual("1234567…8901234");
  });

  it("should return string with ellipsis in the middle with custom split length", () => {
    expect(firstAndLastDigitsWithMiddleHellip("123456789", 5)).toEqual(
      "123456789"
    );
    expect(firstAndLastDigitsWithMiddleHellip("123456789", 2)).toEqual("12…89");
    expect(firstAndLastDigitsWithMiddleHellip("1234567890123456", 8)).toEqual(
      "1234567890123456"
    );
    expect(firstAndLastDigitsWithMiddleHellip("1234567890123456", 7)).toEqual(
      "1234567890123456"
    );
    expect(firstAndLastDigitsWithMiddleHellip("1234567890123456", 6)).toEqual(
      "123456…123456"
    );
  });

  it("should return full string when shorter than or equal to twice the split length", () => {
    expect(firstAndLastDigitsWithMiddleHellip("123", 5)).toEqual("123");
    expect(firstAndLastDigitsWithMiddleHellip("12345", 5)).toEqual("12345");
    expect(firstAndLastDigitsWithMiddleHellip("123456", 5)).toEqual("123456");
    expect(firstAndLastDigitsWithMiddleHellip("1234567890", 5)).toEqual(
      "1234567890"
    );
  });

  it("should handle edge cases", () => {
    expect(firstAndLastDigitsWithMiddleHellip("", 5)).toEqual("");
    expect(firstAndLastDigitsWithMiddleHellip("a", 5)).toEqual("a");
    expect(firstAndLastDigitsWithMiddleHellip("ab", 1)).toEqual("ab");
    expect(firstAndLastDigitsWithMiddleHellip("1234567890123456", 20)).toEqual(
      "1234567890123456"
    );
  });
});
