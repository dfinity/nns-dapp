import { get } from "svelte/store";
import {
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
  SECONDS_IN_MINUTE,
  SECONDS_IN_YEAR,
} from "../constants/constants";
import { i18n } from "../stores/i18n";

type LabelKey = "year" | "day" | "hour" | "minute";
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
  ];
  return periods
    .filter(({ amount }) => amount > 0)
    .slice(0, 2)
    .map(
      (labelInfo) =>
        `${labelInfo.amount} ${
          labelInfo.amount == 1
            ? i18nObj.time[labelInfo.labelKey]
            : i18nObj.time[`${labelInfo.labelKey}_plural`]
        }`
    )
    .join(", ");
};

export const secondsToDate = (seconds: number): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const millisedoncs = seconds * 1000;
  // We only support english for now.
  return new Date(millisedoncs).toLocaleDateString("en", options);
};
