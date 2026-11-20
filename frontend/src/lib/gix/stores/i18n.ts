import en from "$lib/gix/i18n/en.json";
import { readable } from "svelte/store";

export const i18n = readable<GixI18n>({
  lang: "en",
  ...en,
});
