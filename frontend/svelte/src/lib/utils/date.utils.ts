import { get } from "svelte/store";
import { i18n } from "../stores/i18n";

const ONE_MINUTE_SECONDS = 60;
const ONE_HOUR_SECONDS = 60 * 60;
const ONE_DAY_SECONDS = 24 * 60 * 60;
const ONE_YEAR_SECONDS = ((4 * 365 + 1) * ONE_DAY_SECONDS) / 4;

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
  const years = seconds / BigInt(ONE_YEAR_SECONDS);
  const days = (seconds % BigInt(ONE_YEAR_SECONDS)) / BigInt(ONE_DAY_SECONDS);
  const hours = (seconds % BigInt(ONE_DAY_SECONDS)) / BigInt(ONE_HOUR_SECONDS);
  const minutes =
    (seconds % BigInt(ONE_HOUR_SECONDS)) / BigInt(ONE_MINUTE_SECONDS);
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
