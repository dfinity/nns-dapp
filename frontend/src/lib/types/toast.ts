import type { ToastMsg as ToastMsgUI } from "@dfinity/gix-components";
import type { I18nSubstitutions } from "../utils/i18n.utils";

export interface ToastMsg extends Omit<ToastMsgUI, "text" | "id"> {
  id?: symbol;
  labelKey: string;
  detail?: string;
  substitutions?: I18nSubstitutions;
}
