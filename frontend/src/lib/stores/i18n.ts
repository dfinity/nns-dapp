import { readable } from "svelte/store";
import governance from "../i18n/en.governance.json";
import en from "../i18n/en.json";

export const i18n = readable<I18n>({
  lang: "en",
  ...en,
  ...governance,
});
