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
  const split: string[] = (childKey ?? labelKey).split(".");

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

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
const escapeRegExp = (regExpText: string): string =>
  regExpText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

export type I18nSubstitutions = { [from: string]: string };

/**
 * @example
 * ("Why $1?", {$1: "World", Why: "Hello", "?": "!"}) => "Hello World!"
 */
export const replacePlaceholders = (
  text: string,
  substitutions: I18nSubstitutions
): string => {
  let result = text;
  for (const [key, value] of Object.entries(substitutions)) {
    result = result.replace(new RegExp(escapeRegExp(key), "g"), value);
  }

  return result;
};
