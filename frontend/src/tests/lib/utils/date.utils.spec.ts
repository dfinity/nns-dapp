import { SECONDS_IN_DAY, SECONDS_IN_MONTH } from "$lib/constants/constants";
import {
  daysToDuration,
  nanoSecondsToDateTime,
  secondsToDate,
  secondsToDateTime,
  secondsToDissolveDelayDuration,
  secondsToDuration,
  secondsToTime,
} from "$lib/utils/date.utils";
import en from "$tests/mocks/i18n.mock";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";

describe("secondsToDuration", () => {
  // This function should not be smart. It should just make it easier to add
  // numbers together to get the number of seconds we want to test.
  const renderSeconds = ({
    nonLeapYears = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
  }: {
    nonLeapYears?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }) => {
    days += 365 * nonLeapYears;
    hours += 24 * days;
    minutes += 60 * hours;
    seconds += 60 * minutes;
    return secondsToDuration(BigInt(seconds));
  };

  it("should give year details", () => {
    expect(renderSeconds({ nonLeapYears: 1 })).toBe("1 year");
    expect(renderSeconds({ nonLeapYears: 1, seconds: 59 })).toBe("1 year");
    expect(renderSeconds({ nonLeapYears: 1, minutes: 59 })).toBe(
      "1 year, 59 minutes"
    );
    expect(renderSeconds({ nonLeapYears: 1, hours: 23 })).toBe(
      "1 year, 23 hours"
    );
    expect(renderSeconds({ nonLeapYears: 1, days: 1, seconds: -1 })).toBe(
      "1 year, 23 hours"
    );
    expect(renderSeconds({ nonLeapYears: 1, days: 1 })).toBe("1 year, 1 day");
    expect(renderSeconds({ nonLeapYears: 1, days: 2 })).toBe("1 year, 2 days");
    expect(renderSeconds({ nonLeapYears: 2, seconds: -1 })).toBe(
      "1 year, 364 days"
    );
    expect(renderSeconds({ nonLeapYears: 2 })).toBe("2 years");
    expect(renderSeconds({ nonLeapYears: 2, minutes: 59 })).toBe(
      "2 years, 59 minutes"
    );
    expect(renderSeconds({ nonLeapYears: 2, hours: 23 })).toBe(
      "2 years, 23 hours"
    );
    expect(renderSeconds({ nonLeapYears: 2, days: 1 })).toBe("2 years, 1 day");
    expect(renderSeconds({ nonLeapYears: 2, days: 2 })).toBe("2 years, 2 days");
    expect(renderSeconds({ nonLeapYears: 3, seconds: -1 })).toBe(
      "2 years, 364 days"
    );
    expect(renderSeconds({ nonLeapYears: 3 })).toBe("3 years");
    // 4 actual years have a leap day so we add 1 day to 4 nonLeap years.
    expect(renderSeconds({ nonLeapYears: 4, days: 1, seconds: -1 })).toBe(
      "3 years, 365 days"
    );
    expect(renderSeconds({ nonLeapYears: 4, days: 1 })).toBe("4 years");
    expect(renderSeconds({ nonLeapYears: 5, days: 1, seconds: -1 })).toBe(
      "4 years, 364 days"
    );
    expect(renderSeconds({ nonLeapYears: 5, days: 1 })).toBe("5 years");
    expect(renderSeconds({ nonLeapYears: 6, days: 1, seconds: -1 })).toBe(
      "5 years, 364 days"
    );
    expect(renderSeconds({ nonLeapYears: 6, days: 1 })).toBe("6 years");
    expect(renderSeconds({ nonLeapYears: 7, days: 1, seconds: -1 })).toBe(
      "6 years, 364 days"
    );
    expect(renderSeconds({ nonLeapYears: 7, days: 1 })).toBe("7 years");
    // 4 actual years have 2 leap days so we add 2 days to 8 nonLeap years.
    expect(renderSeconds({ nonLeapYears: 8, days: 2, seconds: -1 })).toBe(
      "7 years, 365 days"
    );
    expect(renderSeconds({ nonLeapYears: 8, days: 2 })).toBe("8 years");
    expect(renderSeconds({ nonLeapYears: 9, days: 2, seconds: -1 })).toBe(
      "8 years, 364 days"
    );
    expect(renderSeconds({ nonLeapYears: 9, days: 2 })).toBe("9 years");
  });

  it("should give day details", () => {
    expect(renderSeconds({ days: 1 })).toBe("1 day");
    expect(renderSeconds({ days: 1, seconds: 59 })).toBe("1 day");
    expect(renderSeconds({ days: 1, minutes: 59 })).toBe("1 day, 59 minutes");
    expect(renderSeconds({ days: 1, hours: 1 })).toBe("1 day, 1 hour");
    expect(renderSeconds({ days: 1, hours: 2 })).toBe("1 day, 2 hours");
    expect(renderSeconds({ days: 2, seconds: -1 })).toBe("1 day, 23 hours");
    expect(renderSeconds({ days: 2 })).toBe("2 days");
    expect(renderSeconds({ days: 365, seconds: -1 })).toBe(
      "364 days, 23 hours"
    );
  });

  it("should give hour details", () => {
    expect(renderSeconds({ hours: 1 })).toBe("1 hour");
    expect(renderSeconds({ hours: 1, seconds: 59 })).toBe("1 hour");
    expect(renderSeconds({ hours: 1, minutes: 59 })).toBe("1 hour, 59 minutes");
    expect(renderSeconds({ hours: 2, seconds: -1 })).toBe("1 hour, 59 minutes");
    expect(renderSeconds({ hours: 2 })).toBe("2 hours");
    expect(renderSeconds({ hours: 2, minutes: 59 })).toBe(
      "2 hours, 59 minutes"
    );
    expect(renderSeconds({ hours: 24, seconds: -1 })).toBe(
      "23 hours, 59 minutes"
    );
  });

  it("should give minute details", () => {
    expect(renderSeconds({ minutes: 1 })).toBe("1 minute");
    expect(renderSeconds({ minutes: 1, seconds: 1 })).toBe("1 minute");
    expect(renderSeconds({ minutes: 1, seconds: 59 })).toBe("1 minute");
    expect(renderSeconds({ minutes: 2 })).toBe("2 minutes");
    expect(renderSeconds({ minutes: 2, seconds: 59 })).toBe("2 minutes");
    expect(renderSeconds({ minutes: 60, seconds: -1 })).toBe("59 minutes");
  });

  it("should give seconds details", () => {
    expect(secondsToDuration(BigInt(2))).toBe("2 seconds");
    expect(secondsToDuration(BigInt(59))).toBe("59 seconds");
  });

  it("should give a second details", () => {
    expect(secondsToDuration(BigInt(1))).toBe("1 second");
  });
});

describe("daysToDuration", () => {
  it("should return 1 year", () => {
    expect(daysToDuration(364)).toBe("364 days");
    expect(daysToDuration(365)).toBe("1 year");
    expect(daysToDuration(366)).toBe("1 year, 1 day");
    expect(daysToDuration(367)).toBe("1 year, 2 days");
  });

  it("should return 2 years", () => {
    expect(daysToDuration(2 * 365 - 1)).toBe("1 year, 364 days");
    expect(daysToDuration(2 * 365)).toBe("2 years");
    expect(daysToDuration(2 * 365 + 1)).toBe("2 years, 1 day");
  });

  it("should return 3 years", () => {
    expect(daysToDuration(3 * 365 - 1)).toBe("2 years, 364 days");
    expect(daysToDuration(3 * 365)).toBe("3 years");
    expect(daysToDuration(3 * 365 + 1)).toBe("3 years, 1 day");
  });

  it("should return a leap-year", () => {
    expect(daysToDuration(4 * 365)).toBe("3 years, 365 days");
    expect(daysToDuration(4 * 365 + 1)).toBe("4 years");
    expect(daysToDuration(4 * 365 + 2)).toBe("4 years, 1 day");
  });

  it("should return 5+ years", () => {
    expect(daysToDuration(5 * 365)).toBe("4 years, 364 days");
    expect(daysToDuration(5 * 365 + 1)).toBe("5 years");
    expect(daysToDuration(5 * 365 + 2)).toBe("5 years, 1 day");

    expect(daysToDuration(6 * 365)).toBe("5 years, 364 days");
    expect(daysToDuration(6 * 365 + 1)).toBe("6 years");
    expect(daysToDuration(6 * 365 + 2)).toBe("6 years, 1 day");

    expect(daysToDuration(7 * 365)).toBe("6 years, 364 days");
    expect(daysToDuration(7 * 365 + 1)).toBe("7 years");
    expect(daysToDuration(7 * 365 + 2)).toBe("7 years, 1 day");

    expect(daysToDuration(8 * 365 + 1)).toBe("7 years, 365 days");
    expect(daysToDuration(8 * 365 + 2)).toBe("8 years");
    expect(daysToDuration(8 * 365 + 3)).toBe("8 years, 1 day");
  });

  it("should be consistent with secondsToDuration", () => {
    for (let days = 1; days < 3000; days++) {
      expect({ days, duration: daysToDuration(days) }).toEqual({
        days,
        duration: secondsToDuration(BigInt(days * SECONDS_IN_DAY)),
      });
    }
  });

  it("should return fractions of day", () => {
    expect(daysToDuration(1.5)).toBe("");
    expect(daysToDuration(365.125)).toBe("1 year");
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
    expect(normalizeWhitespace(secondsToDateTime(BigInt(0)))).toEqual(
      "Jan 1, 1970 12:00 AM"
    );
  });

  it("should return formatted date and time", () => {
    // We only support english for now
    const march25of2022InSeconds = Math.round(1648200639061 / 1000);
    const expectedDateText = secondsToDateTime(BigInt(march25of2022InSeconds));
    expect(normalizeWhitespace(expectedDateText)).toEqual(
      "Mar 25, 2022 9:30 AM"
    );
  });
});

describe("nanoSecondsToDateTime", () => {
  it("should return formatted start date and time in 1970", () => {
    expect(normalizeWhitespace(nanoSecondsToDateTime(BigInt(0)))).toEqual(
      "Jan 1, 1970 12:00 AM"
    );
  });

  it("should return formatted date and time", () => {
    // We only support english for now
    const march25of2022InSeconds = Math.round((1648200639061 * 1e9) / 1000);
    const expectedDateText = nanoSecondsToDateTime(
      BigInt(march25of2022InSeconds)
    );
    expect(normalizeWhitespace(expectedDateText)).toEqual(
      "Mar 25, 2022 9:30 AM"
    );
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
