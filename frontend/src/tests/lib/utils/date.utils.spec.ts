import { SECONDS_IN_DAY, SECONDS_IN_MONTH } from "$lib/constants/constants";
import {
  daysToDuration,
  secondsToDate,
  secondsToDateTime,
  secondsToDissolveDelayDuration,
  secondsToDuration,
  secondsToTime,
} from "$lib/utils/date.utils";
import en from "../../mocks/i18n.mock";

describe("secondsToDuration", () => {
  it("should give year details", () => {
    const MORE_THAN_ONE_YEAR = BigInt(60 * 60 * 24 * 365 * 1.5);
    expect(secondsToDuration(MORE_THAN_ONE_YEAR)).toContain(en.time.year);
  });

  it("should give day details", () => {
    const MORE_THAN_ONE_DAY = BigInt(60 * 60 * 24 * 4);
    expect(secondsToDuration(MORE_THAN_ONE_DAY)).toContain(en.time.day);
  });

  it("should give hour details", () => {
    const MORE_THAN_ONE_HOUR = BigInt(60 * 60 * 4);
    expect(secondsToDuration(MORE_THAN_ONE_HOUR)).toContain(en.time.hour);
  });

  it("should give minute details", () => {
    const MORE_THAN_ONE_MINUTE = BigInt(60 * 4);
    expect(secondsToDuration(MORE_THAN_ONE_MINUTE)).toContain(en.time.minute);
  });

  it("should give seconds details", () => {
    expect(secondsToDuration(BigInt(56))).toContain(en.time.second_plural);
  });

  it("should give a second details", () => {
    expect(secondsToDuration(BigInt(1))).toContain(en.time.second);
  });
});

describe("daysToDuration", () => {
  // 376 => "1 Year, 11 Days" => [1, 11]
  const parseDaysToDuration = (days: number) =>
    Array.from(daysToDuration(days).match(/\d+/g)?.map(Number) ?? []);

  it.only("should return 1 year", () => {
    expect(parseDaysToDuration(364)).toEqual([364]);
    expect(parseDaysToDuration(365)).toEqual([1]);
    expect(parseDaysToDuration(366)).toEqual([1, 1]);
  });

  it.only("should return 2 years", () => {
    expect(parseDaysToDuration(729)).toEqual([1, 364]);
    expect(parseDaysToDuration(730)).toEqual([2]);
    expect(parseDaysToDuration(731)).toEqual([2, 1]);
  });

  it.only("should return 3 years", () => {
    expect(parseDaysToDuration(1094)).toEqual([2, 364]);
    expect(parseDaysToDuration(1095)).toEqual([3]);
    expect(parseDaysToDuration(1096)).toEqual([3, 1]);
  });

  it.only("should return a leap-year", () => {
    expect(parseDaysToDuration(1460)).toEqual([3, 365]);
    expect(parseDaysToDuration(1461)).toEqual([4]);
    expect(parseDaysToDuration(1462)).toEqual([4, 1]);
  });

  it.only("should return 5+ years", () => {
    expect(parseDaysToDuration(1825)).toEqual([4, 364]);
    expect(parseDaysToDuration(1826)).toEqual([5]);
    expect(parseDaysToDuration(1827)).toEqual([5, 1]);

    expect(parseDaysToDuration(2190)).toEqual([5, 364]);
    expect(parseDaysToDuration(2191)).toEqual([6]);
    expect(parseDaysToDuration(2192)).toEqual([6, 1]);
  });
});

describe("secondsToDissolveDelayDuration", () => {
  it("should display a day", () => {
    expect(secondsToDissolveDelayDuration(BigInt(SECONDS_IN_DAY))).toContain(
      en.time.day
    );
    expect(secondsToDissolveDelayDuration(BigInt(SECONDS_IN_DAY))).toContain(
      "1"
    );
  });

  it("should display 1 month", () => {
    expect(secondsToDissolveDelayDuration(BigInt(SECONDS_IN_MONTH))).toContain(
      en.time.month
    );
    expect(secondsToDissolveDelayDuration(BigInt(SECONDS_IN_MONTH))).toContain(
      "1"
    );
    expect(
      secondsToDissolveDelayDuration(BigInt(SECONDS_IN_MONTH))
    ).not.toContain(en.time.month_plural);
  });

  it("should display 2 months", () => {
    expect(
      secondsToDissolveDelayDuration(BigInt(SECONDS_IN_MONTH * 2))
    ).toContain(en.time.month_plural);
    expect(
      secondsToDissolveDelayDuration(BigInt(SECONDS_IN_MONTH * 2))
    ).toContain("2");
  });

  it("should display 1 year", () => {
    expect(
      secondsToDissolveDelayDuration(BigInt(SECONDS_IN_MONTH * 12))
    ).toContain(en.time.year);
    expect(
      secondsToDissolveDelayDuration(BigInt(SECONDS_IN_MONTH * 12))
    ).toContain("1");
    expect(
      secondsToDissolveDelayDuration(BigInt(SECONDS_IN_MONTH * 12))
    ).not.toContain(en.time.year_plural);
  });

  it("should display 2 years, 9 months, 11 days", () => {
    expect(secondsToDissolveDelayDuration(BigInt(87654321))).toContain("2");
    expect(secondsToDissolveDelayDuration(BigInt(87654321))).toContain("9");
    expect(secondsToDissolveDelayDuration(BigInt(87654321))).toContain("11");
  });
});

describe("secondsToDate", () => {
  it("starts in 1970", () => {
    expect(secondsToDate(0)).toBe("Jan 1, 1970");
  });

  it("returns day in number, month and year", () => {
    // We only support english for now
    const march25of2022InSeconds = Math.round(1648200639061 / 1000);
    const expectedDateText = secondsToDate(march25of2022InSeconds);
    expect(expectedDateText).toContain("Mar");
    expect(expectedDateText).toContain("2022");
    expect(expectedDateText).toContain("25");
  });
});

describe("secondsToDateTime", () => {
  it("should return formatted start date and time in 1970", () => {
    expect(secondsToDateTime(BigInt(0))).toEqual("Jan 1, 1970 12:00 AM");
  });

  it("should return formatted date and time", () => {
    // We only support english for now
    const march25of2022InSeconds = Math.round(1648200639061 / 1000);
    const expectedDateText = secondsToDateTime(BigInt(march25of2022InSeconds));
    expect(expectedDateText).toEqual("Mar 25, 2022 9:30 AM");
  });
});

describe("secondsToTime", () => {
  it("should be UTC", () => {
    // TZ=UTC
    expect(new Date().getTimezoneOffset()).toBe(0);
  });

  it("should be tested using UTC", () => {
    expect(secondsToTime(0)).toContain("12:00");
  });

  it("should returns formatted time", () => {
    const date = new Date();
    date.setHours(9);
    date.setMinutes(45);
    date.setSeconds(59);
    expect(secondsToTime(+date / 1000)).toContain("9:45");
  });
});
