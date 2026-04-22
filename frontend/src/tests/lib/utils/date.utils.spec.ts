import {
  SECONDS_IN_DAY,
  SECONDS_IN_MONTH,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import {
  daysToDuration,
  daysToSeconds,
  formatDateCompact,
  formatDissolveDelay,
  getFutureDateFromDelayInSeconds,
  nanoSecondsToDateTime,
  secondsToDate,
  secondsToDateTime,
  secondsToRoundedDuration,
  secondsToTime,
} from "$lib/utils/date.utils";
import en from "$tests/mocks/i18n.mock";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import { secondsToDuration } from "@dfinity/utils";

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
        duration: secondsToDuration({ seconds: BigInt(days * SECONDS_IN_DAY) }),
      });
    }
  });

  it("should return fractions of day", () => {
    expect(daysToDuration(1.5)).toBe("1 day, 12 hours");
    expect(daysToDuration(365.125)).toBe("1 year, 3 hours");
  });
});

describe("secondsToRoundedDuration", () => {
  it("should display a day", () => {
    expect(secondsToRoundedDuration(BigInt(SECONDS_IN_DAY))).toContain(
      en.time.day
    );
    expect(secondsToRoundedDuration(BigInt(SECONDS_IN_DAY))).toContain("1");
  });

  it("should display 1 month", () => {
    expect(secondsToRoundedDuration(BigInt(SECONDS_IN_MONTH))).toContain(
      en.time.month
    );
    expect(secondsToRoundedDuration(BigInt(SECONDS_IN_MONTH))).toContain("1");
    expect(secondsToRoundedDuration(BigInt(SECONDS_IN_MONTH))).not.toContain(
      en.time.month_plural
    );
  });

  it("should display 2 months", () => {
    expect(secondsToRoundedDuration(BigInt(SECONDS_IN_MONTH * 2))).toContain(
      en.time.month_plural
    );
    expect(secondsToRoundedDuration(BigInt(SECONDS_IN_MONTH * 2))).toContain(
      "2"
    );
  });

  it("should display 1 year", () => {
    expect(secondsToRoundedDuration(BigInt(SECONDS_IN_MONTH * 12))).toContain(
      en.time.year
    );
    expect(secondsToRoundedDuration(BigInt(SECONDS_IN_MONTH * 12))).toContain(
      "1"
    );
    expect(
      secondsToRoundedDuration(BigInt(SECONDS_IN_MONTH * 12))
    ).not.toContain(en.time.year_plural);
  });

  it("should display 2 years, 9 months, 11 days", () => {
    expect(secondsToRoundedDuration(87_654_321n)).toContain("2");
    expect(secondsToRoundedDuration(87_654_321n)).toContain("9");
    expect(secondsToRoundedDuration(87_654_321n)).toContain("11");
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
    expect(normalizeWhitespace(secondsToDateTime(0n))).toEqual(
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
    expect(normalizeWhitespace(nanoSecondsToDateTime(0n))).toEqual(
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

describe("formatDissolveDelay", () => {
  it("returns empty string for 0 seconds", () => {
    expect(formatDissolveDelay(0n)).toBe("");
  });

  describe("shows exact years for round SECONDS_IN_YEAR multiples", () => {
    it("1 × SECONDS_IN_YEAR → '1 year'", () => {
      expect(formatDissolveDelay(BigInt(SECONDS_IN_YEAR))).toBe("1 year");
    });

    it("2 × SECONDS_IN_YEAR → '2 years'", () => {
      expect(formatDissolveDelay(BigInt(SECONDS_IN_YEAR * 2))).toBe("2 years");
    });

    it("3 × SECONDS_IN_YEAR → '3 years'", () => {
      expect(formatDissolveDelay(BigInt(SECONDS_IN_YEAR * 3))).toBe("3 years");
    });

    it("4 × SECONDS_IN_YEAR → '4 years'", () => {
      expect(formatDissolveDelay(BigInt(SECONDS_IN_YEAR * 4))).toBe("4 years");
    });
  });

  describe("no upward jump when dissolving from a round year", () => {
    it('shows "1 year, 365 days" after 1h dissolving from 2 years', () => {
      const seconds = BigInt(SECONDS_IN_YEAR * 2) - 3600n;
      expect(formatDissolveDelay(seconds)).toBe("1 year, 365 days");
    });

    it('shows "1 year, 365 days" after 6h dissolving from 2 years', () => {
      const seconds = BigInt(SECONDS_IN_YEAR * 2) - 6n * 3600n;
      expect(formatDissolveDelay(seconds)).toBe("1 year, 365 days");
    });
  });

  describe("shows at most 2 most significant units", () => {
    it("drops hours when years and days are both present", () => {
      // 1 year + 2 days + 5 hours — hours dropped
      const seconds = BigInt(SECONDS_IN_YEAR) + BigInt(2 * SECONDS_IN_DAY) + 5n * 3600n;
      expect(formatDissolveDelay(seconds)).toBe("1 year, 2 days");
    });

    it("drops minutes when days and hours are both present", () => {
      // 1 day, 3 hours, 30 minutes — minutes dropped
      const seconds = BigInt(SECONDS_IN_DAY + 3 * 3600 + 30 * 60);
      expect(formatDissolveDelay(seconds)).toBe("1 day, 3 hours");
    });
  });

  describe("year boundary", () => {
    it("just below 1 year shows days and hours, not years", () => {
      expect(formatDissolveDelay(BigInt(SECONDS_IN_YEAR) - 1n)).toBe("365 days, 5 hours");
    });

    it("just above 1 year shows years and seconds", () => {
      expect(formatDissolveDelay(BigInt(SECONDS_IN_YEAR) + 1n)).toBe("1 year, 1 second");
    });
  });

  describe("singular forms", () => {
    it('returns "1 minute" for exactly 60 seconds', () => {
      expect(formatDissolveDelay(60n)).toBe("1 minute");
    });

    it('returns "1 second" for exactly 1 second', () => {
      expect(formatDissolveDelay(1n)).toBe("1 second");
    });

    it('returns "1 minute, 1 second" for 61 seconds', () => {
      expect(formatDissolveDelay(61n)).toBe("1 minute, 1 second");
    });
  });

  describe("2-week dissolve delay progression", () => {
    const TWO_WEEKS = BigInt(14 * SECONDS_IN_DAY);

    it('locked at 2 weeks shows "14 days"', () => {
      expect(formatDissolveDelay(TWO_WEEKS)).toBe("14 days");
    });

    it('after 1h dissolving shows "13 days, 23 hours"', () => {
      expect(formatDissolveDelay(TWO_WEEKS - 3600n)).toBe("13 days, 23 hours");
    });

    it('after 1 day dissolving shows "13 days"', () => {
      expect(formatDissolveDelay(TWO_WEEKS - BigInt(SECONDS_IN_DAY))).toBe("13 days");
    });

    it('with 1 day remaining shows "1 day"', () => {
      expect(formatDissolveDelay(BigInt(SECONDS_IN_DAY))).toBe("1 day");
    });

    it('with 1 day and 1 hour remaining shows "1 day, 1 hour"', () => {
      expect(formatDissolveDelay(BigInt(SECONDS_IN_DAY) + 3600n)).toBe("1 day, 1 hour");
    });

    it('with 1 hour remaining shows "1 hour"', () => {
      expect(formatDissolveDelay(3600n)).toBe("1 hour");
    });

    it('with 30 minutes remaining shows "30 minutes"', () => {
      expect(formatDissolveDelay(1800n)).toBe("30 minutes");
    });
  });
});

describe("daysToSeconds", () => {
  it("returns the days in seconds", () => {
    expect(daysToSeconds(1)).toBe(SECONDS_IN_DAY);
    expect(daysToSeconds(2)).toBe(SECONDS_IN_DAY * 2);
    expect(daysToSeconds(3)).toBe(SECONDS_IN_DAY * 3);
  });

  it("returns integers only", () => {
    expect(daysToSeconds(1.123456)).not.toBe(SECONDS_IN_DAY * 1.123456);
    expect(daysToSeconds(1.123456)).toBe(97067);
  });

  describe("getDateInTheFutureFromDelayedSeconds", () => {
    beforeEach(() => {
      const mockNow = new Date(2023, 10, 14).getTime();
      vi.spyOn(Date, "now").mockImplementation(() => mockNow);
    });

    it("should return correct future date for zero delay", () => {
      const result = getFutureDateFromDelayInSeconds(BigInt(0));
      expect(result).toBe("Nov 14, 2023");
    });

    it("should return correct future date for one day delay", () => {
      const oneDayInSeconds = BigInt(24 * 60 * 60);
      const result = getFutureDateFromDelayInSeconds(oneDayInSeconds);
      expect(result).toBe("Nov 15, 2023"); // One day after mockNow
    });

    it("should return correct future date for large delay", () => {
      const oneYearInSeconds = BigInt(365 * 24 * 60 * 60);
      const result = getFutureDateFromDelayInSeconds(oneYearInSeconds);
      expect(result).toBe("Nov 13, 2024"); // One year after mockNow
    });

    it("should throw error for negative delay", () => {
      expect(() => getFutureDateFromDelayInSeconds(-60n)).toThrow(
        "Delay cannot be negative"
      );
    });
  });
  describe("formatDateCompact", () => {
    it("should return the date formatted as YYYYMMDD", () => {
      const date = new Date("2024-11-22");
      expect(formatDateCompact(date)).toBe("20241122");
    });

    it("should pad single digit month and day", () => {
      const date = new Date("2024-01-01");
      expect(formatDateCompact(date)).toBe("20240101");
    });

    it("should add delimiter when provided and pad single digit month and day", () => {
      const date = new Date("2024-01-01");
      expect(formatDateCompact(date, "-")).toBe("2024-01-01");
    });
  });
});
