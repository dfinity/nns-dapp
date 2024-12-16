import { i18n } from "$lib/stores/i18n";
import { get } from "svelte/store";

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

  const firstKey = split[0];
  const key =
    translations !== undefined
      ? translations[firstKey]
      : get(i18n)[firstKey as keyof I18n];

  if (key === undefined) {
    return labelKey;
  }

  if (typeof key === "object") {
    return translate({
      translations: key as unknown as Record<string, string>,
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

/**
 * Similar to Array.join(", ") but uses " or " before the last element.
 * @example
 * ["Example", "Sample", "Test"] -> "Example, Sample or Test"
 */
export const joinWithOr = (text: string[]): string =>
  text.length > 1
    ? `${text.slice(0, -1).join(", ")} ${get(i18n).core.or} ${text.slice(-1)}`
    : text.join(", ");

// Creates a dot-prefixed string type unless empty
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type StringKeyOf<T> = Extract<keyof T, string>;

// Recursively builds a union type of nested object paths in dot notation:
// 1. Takes an object type T
// 2. For each key K in T:
//    - If T[K] is an object: creates path "K.nestedKey"
//    - If T[K] is primitive: excludes it (never type)
// 3. Combines all paths into a union type
// 4. Uses 'extends infer D' pattern to:
//    - Capture the resulting type
//    - Extract only string literals from it
//    - Filter out any non-string types
// Example: { user: { name: string, settings: { theme: string } } }
// Generates: "user.name" | "user.settings" | "user.settings.theme"
type DotNestedKeys<T> = (
  T extends object
    ? {
        // First exclusion: In the mapped type, defines which keys to process
        [K in StringKeyOf<T>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}`;
        // Second exclusion: Indexes the resulting object type to create a union
      }[StringKeyOf<T>]
    : ""
) extends infer D
  ? Extract<D, string>
  : never;

// Type containing all possible i18n keys in dot notation (e.g., "reporting.error_csv_generation")
export type I18nKeys = DotNestedKeys<I18n>;
