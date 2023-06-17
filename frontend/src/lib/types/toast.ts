import type { I18nSubstitutions } from "$lib/utils/i18n.utils";
import type { ToastMsg as ToastMsgUI } from "@dfinity/gix-components";

export interface ToastMsg extends Omit<ToastMsgUI, "text" | "id"> {
  id?: symbol;
  labelKey: string;
  detail?: string;
  substitutions?: I18nSubstitutions;
}
