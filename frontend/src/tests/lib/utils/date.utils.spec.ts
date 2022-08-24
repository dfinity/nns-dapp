import {
  secondsToDate,
  secondsToDateTime,
  secondsToDuration,
  secondsToTime,
} from "../../../lib/utils/date.utils";
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
});

describe("secondsToDate", () => {
  it("starts in 1970", () => {
    expect(secondsToDate(0)).toBe("January 1, 1970");
  });

  it("returns day in number, month and year", () => {
    // We only support english for now
    const march25of2022InSeconds = Math.round(1648200639061 / 1000);
    const expectedDateText = secondsToDate(march25of2022InSeconds);
    expect(expectedDateText).toContain("March");
    expect(expectedDateText).toContain("2022");
    expect(expectedDateText).toContain("25");
  });
});

describe("secondsToDateTime", () => {
  it("should return formatted start date and time in 1970", () => {
    expect(secondsToDateTime(BigInt(0))).toEqual("January 1, 1970 at 12:00 AM");
  });

  it("should return formatted date and time", () => {
    // We only support english for now
    const march25of2022InSeconds = Math.round(1648200639061 / 1000);
    const expectedDateText = secondsToDateTime(BigInt(march25of2022InSeconds));
    expect(expectedDateText).toEqual("March 25, 2022 at 9:30 AM");
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
