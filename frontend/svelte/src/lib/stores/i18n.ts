import { readable } from "svelte/store";
import en from "../i18n/en.json";

export const i18n = readable<I18n>({
  lang: "en",
  ...en,
});
