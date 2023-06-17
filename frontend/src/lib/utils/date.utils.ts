import {
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
  SECONDS_IN_MINUTE,
  SECONDS_IN_MONTH,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import { i18n } from "$lib/stores/i18n";
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

export const secondsToDuration = (seconds: bigint): string => {
  const i18nObj = get(i18n);
  const years = seconds / BigInt(SECONDS_IN_YEAR);
  const days = (seconds % BigInt(SECONDS_IN_YEAR)) / BigInt(SECONDS_IN_DAY);
  const hours = (seconds % BigInt(SECONDS_IN_DAY)) / BigInt(SECONDS_IN_HOUR);
  const minutes =
    (seconds % BigInt(SECONDS_IN_HOUR)) / BigInt(SECONDS_IN_MINUTE);
  const periods = [
    createLabel("year", years),
    createLabel("day", days),
    createLabel("hour", hours),
    createLabel("minute", minutes),
    ...(seconds > BigInt(0) && seconds < BigInt(60)
      ? [createLabel("second", seconds)]
      : []),
  ];

  return periods
    .filter(({ amount }) => amount > 0)
    .slice(0, 2)
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
  const i18nObj = get(i18n);
  const DAYS_IN_YEAR = SECONDS_IN_YEAR / SECONDS_IN_DAY;
  // eg. 365 + yearRoundCompensation == 365.25 == 1 year
  // (4 - leap-year)
  const yearRoundCompensation = (Math.ceil(days / DAYS_IN_YEAR) % 4) * 0.25;
  const compensation = yearRoundCompensation === 1 ? 0 : yearRoundCompensation;
  // round years down
  const yearCount = Math.floor((days + compensation) / DAYS_IN_YEAR);
  // round days up (safer for dissolve delay)
  const dayCount = Math.ceil(days - yearCount * DAYS_IN_YEAR);

  const periods = [
    createLabel("year", BigInt(yearCount)),
    createLabel("day", BigInt(dayCount)),
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
export const secondsToDissolveDelayDuration = (seconds: bigint): string => {
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
  Math.ceil(seconds / SECONDS_IN_DAY);
export const daysToSeconds = (days: number): number => days * SECONDS_IN_DAY;

export const nowInSeconds = (): number => Math.round(Date.now() / 1000);
export const nowInBigIntNanoSeconds = (): bigint =>
  BigInt(Date.now()) * BigInt(1e6);
