import { readable } from "svelte/store";
import governance from "$lib/i18n/en.governance.json";
import en from "$lib/i18n/en.json";

export const i18n = readable<I18n>({
  lang: "en",
  ...en,
  ...governance,
});
