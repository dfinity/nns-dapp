import { get } from "svelte/store";
import { i18n } from "../stores/i18n";

/**
 * Translate a label key i.e. find the corresponding translation for a key.
 * Example: returns "Close" for key "core.close"
 *
 * If no corresponding translation is find, returns the labelKey (can be useful if we forget a translation one day).
 * Example: return "hello.world" for key "hello.world"
 */
export const translate = ({
  translations,
  childKey,
  labelKey,
}: {
  translations?: Record<string, string>;
  childKey?: string;
  labelKey: string;
}): string => {
  const split: string[] = (childKey || labelKey).split(".");

  if (split[0] === "") {
    return labelKey;
  }

  const key: string | Record<string, string> | undefined = (translations ||
    get(i18n))[split[0]];

  if (key === undefined) {
    return labelKey;
  }

  if (typeof key === "object") {
    return translate({
      translations: key,
      labelKey,
      childKey: split.slice(1).join("."),
    });
  }

  return key as string;
};
