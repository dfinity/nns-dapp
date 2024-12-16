import type { I18nKeys, I18nSubstitutions } from "$lib/utils/i18n.utils";
import type { ToastMsg as ToastMsgUI } from "@dfinity/gix-components";

// We use empty object intersection (string & {}) instead of plain string
// to prevent TS from widening the type to just 'string', which would lose
// autocomplete suggestions from I18nKeys
// eslint-disable-next-line @typescript-eslint/ban-types
export type ToastLabelKey = I18nKeys | (string & {});

export interface ToastMsg extends Omit<ToastMsgUI, "text" | "id"> {
  id?: symbol;
  labelKey: ToastLabelKey;
  detail?: string;
  substitutions?: I18nSubstitutions;
}
