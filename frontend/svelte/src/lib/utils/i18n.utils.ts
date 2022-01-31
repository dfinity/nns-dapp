import { get } from "svelte/store";
import { i18n } from "../stores/i18n";

export const translate = ({
  translations,
  labelKey,
}: {
  translations?: Record<string, string>;
  labelKey: string;
}): string | "" => {
  const split: string[] = labelKey.split(".");

  if (split[0] === "") {
    return "";
  }

  const key: string | Record<string, string> | undefined = (translations ||
    get(i18n))[split[0]];

  if (key === undefined) {
    return "";
  }

  if (typeof key === "object") {
    return translate({ translations: key, labelKey: split.slice(1).join(".") });
  }

  return key as string;
};
