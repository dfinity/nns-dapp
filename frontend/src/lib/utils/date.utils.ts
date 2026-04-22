import {
  SECONDS_IN_DAY,
  SECONDS_IN_MONTH,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import { i18n } from "$lib/stores/i18n";
import { secondsToDuration } from "@dfinity/utils";
import { get } from "svelte/store";

type LabelKey = "year" | "month" | "day" | "hour" | "minute" | "second";
type LabelInfo = {
  labelKey: LabelKey;
  amount: number;
};
const createLabel = (labelKey: LabelKey, amount: bigint): LabelInfo => ({
  labelKey,
  amount: Number(amount),
});

/**
 * Rounds days to full years (1 year = 365.25 days).
 *
 * @example
 * - 364 => 364 days
 * - 365 => 1 year
 * - 730 => 2 years
 * - 729 => 1 year, 364 days
 * More samples in unit tests
 *
 * @param days
 */
export const daysToDuration = (days: number): string => {
  const { time } = get(i18n);
  return secondsToDuration({
    seconds: BigInt(Math.ceil(days * SECONDS_IN_DAY)),
    i18n: {
      year: time.year,
      year_plural: time.year_plural,
      month: time.month,
      month_plural: time.month_plural,
      day: time.day,
      day_plural: time.day_plural,
      hour: time.hour,
      hour_plural: time.hour_plural,
      minute: time.minute,
      minute_plural: time.minute_plural,
      second: time.second,
      second_plural: time.second_plural,
    },
  });
};

/**
 * Displays years, months and days.
 *
 * Uses constants for `year` and `month`:
 * - a year = 365.25 * 24 * 60 * 60
 * - a month = 1 year / 12
 * - rounds up days
 *
 * @param seconds
 */
export const secondsToRoundedDuration = (seconds: bigint): string => {
  const i18nObj = get(i18n);
  const years = seconds / BigInt(SECONDS_IN_YEAR);
  const months = (seconds % BigInt(SECONDS_IN_YEAR)) / BigInt(SECONDS_IN_MONTH);
  const days = BigInt(
    Math.ceil((Number(seconds) % SECONDS_IN_MONTH) / SECONDS_IN_DAY)
  );
  const periods = [
    createLabel("year", years),
    createLabel("month", months),
    createLabel("day", days),
  ];

  return periods
    .filter(({ amount }) => amount > 0)
    .map(
      (labelInfo) =>
        `${labelInfo.amount} ${
          labelInfo.amount === 1
            ? i18nObj.time[labelInfo.labelKey]
            : i18nObj.time[`${labelInfo.labelKey}_plural`]
        }`
    )
    .join(", ");
};

export const secondsToDateTime = (seconds: bigint): string =>
  `${secondsToDate(Number(seconds))} ${secondsToTime(Number(seconds))}`;

export const nanoSecondsToDateTime = (nanoSeconds: bigint): string => {
  const seconds = Number(nanoSeconds / BigInt(1e9));
  return `${secondsToDate(seconds)} ${secondsToTime(seconds)}`;
};

export const secondsToDate = (seconds: number): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const milliseconds = seconds * 1000;
  // We only support english for now.
  return new Date(milliseconds).toLocaleDateString("en", options);
};

export const secondsToTime = (seconds: number): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeStyle: "short",
  };
  const milliseconds = seconds * 1000;
  // We only support english for now.
  return new Date(milliseconds).toLocaleTimeString("en", options);
};

export const secondsToDays = (seconds: number): number =>
  seconds / SECONDS_IN_DAY;

// Uses 365.25-day years (SECONDS_IN_YEAR) throughout so that N * SECONDS_IN_YEAR
// produces exactly "N years" with no sub-day remainder, eliminating the artifact
// that secondsToDuration produces when mixing 365.25-day and 365-day year models.
const SECONDS_IN_YEAR_BIG = BigInt(SECONDS_IN_YEAR);
const SECONDS_IN_DAY_BIG = BigInt(SECONDS_IN_DAY);
const SECONDS_IN_HOUR = 3600n;
const SECONDS_IN_MINUTE = 60n;
export const formatDissolveDelay = (seconds: bigint): string => {
  if (seconds === 0n) return "";
  const { time } = get(i18n);

  const label = (n: bigint, singular: string, plural: string) =>
    `${n} ${n === 1n ? singular : plural}`;

  const years = seconds / SECONDS_IN_YEAR_BIG;
  let rem = seconds % SECONDS_IN_YEAR_BIG;
  const days = rem / SECONDS_IN_DAY_BIG;
  rem = rem % SECONDS_IN_DAY_BIG;
  const hours = rem / SECONDS_IN_HOUR;
  rem = rem % SECONDS_IN_HOUR;
  const minutes = rem / SECONDS_IN_MINUTE;
  const secs = rem % SECONDS_IN_MINUTE;

  const parts: string[] = [];
  if (years > 0n) parts.push(label(years, time.year, time.year_plural));
  if (days > 0n) parts.push(label(days, time.day, time.day_plural));
  if (hours > 0n) parts.push(label(hours, time.hour, time.hour_plural));
  if (minutes > 0n) parts.push(label(minutes, time.minute, time.minute_plural));
  if (secs > 0n) parts.push(label(secs, time.second, time.second_plural));

  return parts.slice(0, 2).join(", ");
};
export const daysToSeconds = (days: number): number =>
  Math.round(days * SECONDS_IN_DAY);

export const nowInSeconds = (): number => Math.round(Date.now() / 1000);
export const nowInBigIntNanoSeconds = (): bigint =>
  BigInt(Date.now()) * BigInt(1e6);

export const getFutureDateFromDelayInSeconds = (seconds: bigint): string => {
  if (seconds < 0n) {
    throw new Error("Delay cannot be negative");
  }

  const todayPlusDelayedSeconds = nowInSeconds() + Number(seconds);
  return secondsToDate(todayPlusDelayedSeconds);
};

/**
 * Formats a date into YYYYMMDD string
 * @param {Date} date - The date to format
 * @param {string} delimiter - Custom delimiter to separate year, month and day. Default is empty string.
 * @returns {string} Date formatted as YYYYMMDD
 * @example
 * ```
 * formatDateCompact(new Date('2024-11-22')) // Returns "20241122"
 * formatDateCompact(new Date('2024-11-22'), '-') // Returns "2024-11-22"
 * ```
 */
export const formatDateCompact = (
  date: Date,
  delimiter: string = ""
): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return [year, month, day].join(delimiter);
};
