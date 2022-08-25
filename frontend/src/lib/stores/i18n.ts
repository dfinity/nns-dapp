import { readable } from "svelte/store";
import en from "../i18n/en.json";
import governance from "../i18n/en.governance.json";

export const i18n = readable<I18n>({
  lang: "en",
  ...en,
  ...governance
});
